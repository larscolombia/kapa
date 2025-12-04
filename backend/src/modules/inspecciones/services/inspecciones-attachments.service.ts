import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InspeccionAttachment } from '../../../database/entities/inspeccion-attachment.entity';
import { InspeccionReport } from '../../../database/entities/inspeccion-report.entity';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

@Injectable()
export class InspeccionesAttachmentsService {
  private s3Client: S3Client;
  private bucketName: string;

  // Configuración de límites
  private readonly MAX_ATTACHMENTS = 10;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB en bytes
  private readonly ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

  constructor(
    @InjectRepository(InspeccionAttachment)
    private attachmentRepo: Repository<InspeccionAttachment>,
    @InjectRepository(InspeccionReport)
    private reportRepo: Repository<InspeccionReport>,
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

  async uploadAttachment(reportId: number, file: Express.Multer.File, userId: number): Promise<InspeccionAttachment> {
    // Validar que el reporte existe y está abierto
    const report = await this.reportRepo.findOne({
      where: { report_id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Reporte de Inspección #${reportId} no encontrado`);
    }

    if (report.estado !== 'abierto') {
      throw new BadRequestException('Solo se pueden agregar adjuntos a reportes abiertos');
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
    const s3Key = `inspecciones/reports/${reportId}/${timestamp}-${sanitizedFilename}`;

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

    return savedAttachment;
  }

  async getAttachments(reportId: number): Promise<InspeccionAttachment[]> {
    const report = await this.reportRepo.findOne({
      where: { report_id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Reporte de Inspección #${reportId} no encontrado`);
    }

    return this.attachmentRepo.find({
      where: { report_id: reportId },
      relations: ['creator'],
      order: { created_at: 'ASC' },
    });
  }

  async getAttachment(reportId: number, attachmentId: number): Promise<InspeccionAttachment> {
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

  async deleteAttachment(reportId: number, attachmentId: number, userId: number, userRoleId: number): Promise<void> {
    const attachment = await this.getAttachment(reportId, attachmentId);

    // Verificar que el reporte está abierto
    const report = await this.reportRepo.findOne({
      where: { report_id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Reporte de Inspección #${reportId} no encontrado`);
    }

    const isAdmin = userRoleId === 1;

    if (report.estado !== 'abierto' && !isAdmin) {
      throw new BadRequestException('Solo administradores pueden eliminar adjuntos de reportes cerrados');
    }

    // Verificar que el usuario es el propietario o admin
    if (report.propietario_user_id !== userId && !isAdmin) {
      throw new ForbiddenException('Solo el propietario o un administrador puede eliminar adjuntos');
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
  }

  /**
   * Obtiene URLs de preview para múltiples adjuntos
   */
  async getAttachmentsWithUrls(reportId: number): Promise<any[]> {
    const attachments = await this.getAttachments(reportId);
    
    const attachmentsWithUrls = await Promise.all(
      attachments.map(async (att) => {
        const previewUrl = await this.getPresignedUrl(reportId, att.attachment_id, 'inline');
        return {
          ...att,
          preview_url: previewUrl,
        };
      })
    );

    return attachmentsWithUrls;
  }
}
