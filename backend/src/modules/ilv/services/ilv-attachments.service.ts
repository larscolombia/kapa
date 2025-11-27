import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IlvAttachment } from '../../../database/entities/ilv-attachment.entity';
import { IlvReport } from '../../../database/entities/ilv-report.entity';
import { IlvAudit } from '../../../database/entities/ilv-audit.entity';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

@Injectable()
export class IlvAttachmentsService {
  private s3Client: S3Client;
  private bucketName: string;

  // Configuración de límites
  private readonly MAX_ATTACHMENTS = 5;
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes
  private readonly ALLOWED_MIMES = ['image/jpeg', 'image/png', 'application/pdf'];

  constructor(
    @InjectRepository(IlvAttachment)
    private attachmentRepo: Repository<IlvAttachment>,
    @InjectRepository(IlvReport)
    private reportRepo: Repository<IlvReport>,
    @InjectRepository(IlvAudit)
    private auditRepo: Repository<IlvAudit>,
  ) {
    this.bucketName = process.env.AWS_BUCKET_NAME || 'repositorio-documental-kapa';
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadAttachment(reportId: number, file: Express.Multer.File, userId: number): Promise<IlvAttachment> {
    // Validar que el reporte existe y está abierto
    const report = await this.reportRepo.findOne({
      where: { report_id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Reporte ILV #${reportId} no encontrado`);
    }

    if (report.estado !== 'abierto') {
      throw new BadRequestException('Solo se pueden agregar adjuntos a reportes abiertos');
    }

    // Validar que el usuario es el propietario
    if (report.propietario_user_id !== userId) {
      throw new ForbiddenException('Solo el propietario puede agregar adjuntos');
    }

    // Validar MIME type
    if (!this.ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Formato de archivo no permitido. Solo se aceptan: ${this.ALLOWED_MIMES.join(', ')}`
      );
    }

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido de ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
    }

    // Validar máximo de adjuntos
    const currentCount = await this.attachmentRepo.count({
      where: { report_id: reportId },
    });

    if (currentCount >= this.MAX_ATTACHMENTS) {
      throw new BadRequestException(
        `Se ha alcanzado el límite máximo de ${this.MAX_ATTACHMENTS} adjuntos por reporte`
      );
    }

    // Calcular hash SHA256 para deduplicación
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Verificar si ya existe un archivo con el mismo hash en este reporte
    const existingAttachment = await this.attachmentRepo.findOne({
      where: { report_id: reportId, file_hash: fileHash },
    });

    if (existingAttachment) {
      throw new BadRequestException('Este archivo ya ha sido adjuntado al reporte');
    }

    // Generar S3 key único
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `ilv/reports/${reportId}/${timestamp}-${sanitizedFilename}`;

    // Subir a S3
    try {
      const putCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          reportId: reportId.toString(),
          uploadedBy: userId.toString(),
          originalName: file.originalname,
        },
      });

      await this.s3Client.send(putCommand);
    } catch (error) {
      console.error('Error subiendo archivo a S3:', error);
      throw new BadRequestException('Error al subir el archivo al almacenamiento');
    }

    // Guardar registro en BD
    const attachment = this.attachmentRepo.create({
      report_id: reportId,
      filename: file.originalname,
      s3_key: s3Key,
      mime_type: file.mimetype,
      size_bytes: file.size,
      file_hash: fileHash,
      created_by: userId,
    });

    const savedAttachment = await this.attachmentRepo.save(attachment);

    // Auditar
    await this.auditRepo.save({
      entidad: 'ilv_attachment',
      entidad_id: savedAttachment.attachment_id,
      accion: 'upload',
      actor_id: userId,
      diff_json: {
        filename: file.originalname,
        size_bytes: file.size,
        mime_type: file.mimetype,
      },
    });

    return savedAttachment;
  }

  async getAttachments(reportId: number): Promise<IlvAttachment[]> {
    const report = await this.reportRepo.findOne({
      where: { report_id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Reporte ILV #${reportId} no encontrado`);
    }

    return this.attachmentRepo.find({
      where: { report_id: reportId },
      relations: ['creator'],
      order: { created_at: 'ASC' },
    });
  }

  async getAttachment(reportId: number, attachmentId: number): Promise<IlvAttachment> {
    const attachment = await this.attachmentRepo.findOne({
      where: { attachment_id: attachmentId, report_id: reportId },
      relations: ['creator'],
    });

    if (!attachment) {
      throw new NotFoundException(`Adjunto #${attachmentId} no encontrado en el reporte #${reportId}`);
    }

    return attachment;
  }

  async getPresignedUrl(
    reportId: number,
    attachmentId: number,
    disposition: 'inline' | 'attachment',
  ): Promise<string> {
    const attachment = await this.getAttachment(reportId, attachmentId);

    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: attachment.s3_key,
      ResponseContentDisposition: `${disposition}; filename="${encodeURIComponent(attachment.filename)}"`,
      ResponseContentType: attachment.mime_type,
    });

    try {
      const url = await getSignedUrl(this.s3Client, getCommand, { expiresIn: 3600 }); // 1 hora
      return url;
    } catch (error) {
      console.error('Error generando URL firmada:', error);
      throw new BadRequestException('Error al generar URL de descarga');
    }
  }

  async deleteAttachment(reportId: number, attachmentId: number, userId: number): Promise<void> {
    const attachment = await this.getAttachment(reportId, attachmentId);

    // Verificar que el reporte está abierto
    const report = await this.reportRepo.findOne({
      where: { report_id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Reporte ILV #${reportId} no encontrado`);
    }

    if (report.estado !== 'abierto') {
      throw new BadRequestException('Solo se pueden eliminar adjuntos de reportes abiertos');
    }

    // Verificar que el usuario es el propietario
    if (report.propietario_user_id !== userId) {
      throw new ForbiddenException('Solo el propietario puede eliminar adjuntos');
    }

    // Eliminar de S3
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: attachment.s3_key,
      });

      await this.s3Client.send(deleteCommand);
    } catch (error) {
      console.error('Error eliminando archivo de S3:', error);
      // Continuamos con la eliminación de BD aunque falle S3
    }

    // Eliminar de BD
    await this.attachmentRepo.remove(attachment);

    // Auditar
    await this.auditRepo.save({
      entidad: 'ilv_attachment',
      entidad_id: attachmentId,
      accion: 'delete',
      actor_id: userId,
      diff_json: {
        filename: attachment.filename,
        s3_key: attachment.s3_key,
      },
    });
  }
}
