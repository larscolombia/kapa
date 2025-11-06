import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportFile } from '@entities/support-file.entity';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class SupportsService {
  private s3Client: S3Client;
  private bucketName = process.env.AWS_S3_BUCKET || 'repositorio-documental-kapa';

  constructor(
    @InjectRepository(SupportFile)
    private supportFileRepository: Repository<SupportFile>,
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async getSupportFiles(): Promise<SupportFile[]> {
    return this.supportFileRepository.find({
      relations: ['created_by_user'],
      order: { category: 'ASC', display_name: 'ASC' },
    });
  }

  async getSupportFilesByCategory(category: string): Promise<SupportFile[]> {
    return this.supportFileRepository.find({
      where: { category },
      relations: ['created_by_user'],
      order: { display_name: 'ASC' },
    });
  }

  async getSupportFileById(id: number): Promise<SupportFile> {
    const supportFile = await this.supportFileRepository.findOne({
      where: { support_file_id: id },
      relations: ['created_by_user'],
    });

    if (!supportFile) {
      throw new NotFoundException('Archivo de soporte no encontrado');
    }

    return supportFile;
  }

  async createSupportFile(
    supportFileData: Partial<SupportFile>,
  ): Promise<SupportFile> {
    await this.validateSupportFileRequiredFields(supportFileData);

    const supportFile = this.supportFileRepository.create(supportFileData);
    return this.supportFileRepository.save(supportFile);
  }

  async updateSupportFile(
    id: number,
    supportFileData: Partial<SupportFile>,
  ): Promise<SupportFile> {
    const supportFile = await this.getSupportFileById(id);

    await this.validateSupportFileRequiredFields(supportFileData, true);

    const updatedSupportFile = this.supportFileRepository.merge(
      supportFile,
      supportFileData,
    );

    return this.supportFileRepository.save(updatedSupportFile);
  }

  async deleteSupportFile(id: number): Promise<void> {
    const supportFile = await this.getSupportFileById(id);
    await this.supportFileRepository.remove(supportFile);
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.supportFileRepository
      .createQueryBuilder('support_file')
      .select('DISTINCT(support_file.category)', 'category')
      .getRawMany();

    return categories.map(item => item.category);
  }

  async uploadFileToS3(file: Buffer, fileName: string, category: string): Promise<string> {
    try {
      // Generar nombre único para evitar colisiones
      const timestamp = Date.now();
      const fileExtension = fileName.split('.').pop();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const s3Key = `soportes-de-interes/${category}/${timestamp}_${sanitizedFileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: file,
        ContentType: this.getContentType(fileExtension),
        ServerSideEncryption: 'AES256',
      });

      await this.s3Client.send(command);
      return s3Key;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new BadRequestException('Error al subir el archivo a S3');
    }
  }

  async getPresignedUploadUrl(fileName: string, category: string): Promise<{ uploadUrl: string, fileKey: string }> {
    try {
      // Generar nombre único para evitar colisiones
      const timestamp = Date.now();
      const fileExtension = fileName.split('.').pop();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const s3Key = `soportes-de-interes/${category}/${timestamp}_${sanitizedFileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        ContentType: this.getContentType(fileExtension),
        ServerSideEncryption: 'AES256',
      });

      // URL válida por 15 minutos para subida
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
      
      return { uploadUrl, fileKey: s3Key };
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw new BadRequestException('Error al generar URL de subida');
    }
  }

  async getPresignedUrl(fileKey: string, disposition: 'inline' | 'attachment' = 'attachment'): Promise<string> {
    try {
      const fileName = fileKey.split('/').pop(); // Obtener solo el nombre del archivo
      const contentDisposition = disposition === 'inline'
        ? 'inline'
        : `attachment; filename="${fileName}"`;

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        ResponseContentDisposition: contentDisposition,
      });

      // URL válida por 1 hora
      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      return presignedUrl;
    } catch (error) {
      throw new BadRequestException('Error al generar URL firmada');
    }
  }

  private getContentType(extension: string): string {
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
    };
    
    return mimeTypes[extension?.toLowerCase()] || 'application/octet-stream';
  }

  private async validateSupportFileRequiredFields(
    data: Partial<SupportFile>,
    isUpdate = false,
  ): Promise<void> {
    if (!isUpdate && !data.name) {
      throw new BadRequestException('El campo "name" es obligatorio');
    }

    if (!isUpdate && !data.display_name) {
      throw new BadRequestException('El campo "display_name" es obligatorio');
    }

    if (!isUpdate && !data.category) {
      throw new BadRequestException('El campo "category" es obligatorio');
    }

    if (!isUpdate && !data.file_path) {
      throw new BadRequestException('El campo "file_path" es obligatorio');
    }

    // Verificar que no exista otro archivo con el mismo nombre solo si se proporciona un nombre nuevo
    if (data.name) {
      const existingFile = await this.supportFileRepository.findOne({
        where: { name: data.name },
      });

      if (existingFile && (!isUpdate || existingFile.support_file_id !== data.support_file_id)) {
        throw new BadRequestException('Ya existe un archivo con este nombre');
      }
    }
  }
}