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
    const serviceId = `SERVICE-CREATE-${Date.now()}`;
    console.log(`[${serviceId}] === createSupportFile INICIO ===`);
    console.log(`[${serviceId}] Datos recibidos:`, JSON.stringify(supportFileData, null, 2));
    console.log(`[${serviceId}] Tipos de datos:`);
    console.log(`[${serviceId}]   - name: ${typeof supportFileData.name} = "${supportFileData.name}"`);
    console.log(`[${serviceId}]   - display_name: ${typeof supportFileData.display_name} = "${supportFileData.display_name}"`);
    console.log(`[${serviceId}]   - category: ${typeof supportFileData.category} = "${supportFileData.category}"`);
    console.log(`[${serviceId}]   - file_path: ${typeof supportFileData.file_path} = "${supportFileData.file_path}"`);
    console.log(`[${serviceId}]   - file_size: ${typeof supportFileData.file_size} = ${supportFileData.file_size}`);
    console.log(`[${serviceId}]   - mime_type: ${typeof supportFileData.mime_type} = "${supportFileData.mime_type}"`);
    console.log(`[${serviceId}]   - created_by_user: ${typeof supportFileData.created_by_user} = ${JSON.stringify(supportFileData.created_by_user)}`);

    try {
      console.log(`[${serviceId}] Validando campos requeridos...`);
      await this.validateSupportFileRequiredFields(supportFileData);
      console.log(`[${serviceId}] ✓ Validación exitosa`);

      console.log(`[${serviceId}] Creando entidad con create()...`);
      const supportFile = this.supportFileRepository.create(supportFileData);
      console.log(`[${serviceId}] ✓ Entidad creada (sin guardar):`, JSON.stringify(supportFile, null, 2));
      console.log(`[${serviceId}]   - file_size en entidad: ${typeof supportFile.file_size} = ${supportFile.file_size}`);

      console.log(`[${serviceId}] Guardando en BD con save()...`);
      const savedFile = await this.supportFileRepository.save(supportFile);
      console.log(`[${serviceId}] ✓ Guardado exitoso en BD`);
      console.log(`[${serviceId}]   - ID generado: ${savedFile.support_file_id}`);
      console.log(`[${serviceId}]   - created_at: ${savedFile.created_at}`);
      console.log(`[${serviceId}] Archivo guardado completo:`, JSON.stringify(savedFile, null, 2));

      console.log(`[${serviceId}] === createSupportFile FIN EXITOSO ===`);
      return savedFile;
    } catch (error) {
      console.error(`[${serviceId}] === ERROR EN createSupportFile ===`);
      console.error(`[${serviceId}] Error type: ${error.constructor.name}`);
      console.error(`[${serviceId}] Error name: ${error.name}`);
      console.error(`[${serviceId}] Error message: ${error.message}`);

      if (error.code) {
        console.error(`[${serviceId}] PostgreSQL Error code: ${error.code}`);
      }
      if (error.constraint) {
        console.error(`[${serviceId}] Constraint violada: ${error.constraint}`);
      }
      if (error.detail) {
        console.error(`[${serviceId}] Error detail: ${error.detail}`);
      }
      if (error.query) {
        console.error(`[${serviceId}] Query ejecutado:`, error.query);
      }
      if (error.parameters) {
        console.error(`[${serviceId}] Parámetros del query:`, JSON.stringify(error.parameters, null, 2));
      }
      if (error.driverError) {
        console.error(`[${serviceId}] Driver error:`, error.driverError);
      }

      console.error(`[${serviceId}] Stack trace completo:`, error.stack);
      console.error(`[${serviceId}] === FIN ERROR ===`);
      throw error;
    }
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
    const serviceId = `SERVICE-S3UPLOAD-${Date.now()}`;
    console.log(`[${serviceId}] === uploadFileToS3 INICIO ===`);
    console.log(`[${serviceId}] Parámetros:`);
    console.log(`[${serviceId}]   - fileName: "${fileName}"`);
    console.log(`[${serviceId}]   - category: "${category}"`);
    console.log(`[${serviceId}]   - file Buffer length: ${file?.length || 'undefined'}`);
    console.log(`[${serviceId}]   - file Buffer type: ${typeof file}`);

    try {
      console.log(`[${serviceId}] Generando nombre único...`);
      const timestamp = Date.now();
      console.log(`[${serviceId}]   - Timestamp: ${timestamp}`);

      const fileExtension = fileName.split('.').pop();
      console.log(`[${serviceId}]   - Extensión: "${fileExtension}"`);

      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      console.log(`[${serviceId}]   - Sanitizado: "${sanitizedFileName}"`);

      const s3Key = `soportes-de-interes/${category}/${timestamp}_${sanitizedFileName}`;
      console.log(`[${serviceId}]   - S3 Key: "${s3Key}"`);

      const contentType = this.getContentType(fileExtension);
      console.log(`[${serviceId}]   - Content-Type: "${contentType}"`);

      console.log(`[${serviceId}] Creando comando S3 PutObject...`);
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: file,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
      });
      console.log(`[${serviceId}]   - Bucket: ${this.bucketName}`);

      console.log(`[${serviceId}] Enviando archivo a S3...`);
      const s3Response = await this.s3Client.send(command);
      console.log(`[${serviceId}] ✓ S3 Upload exitoso`);
      console.log(`[${serviceId}]   - ETag: ${s3Response.ETag}`);
      console.log(`[${serviceId}]   - ServerSideEncryption: ${s3Response.ServerSideEncryption}`);

      console.log(`[${serviceId}] === uploadFileToS3 FIN EXITOSO ===`);
      return s3Key;
    } catch (error) {
      console.error(`[${serviceId}] === ERROR EN uploadFileToS3 ===`);
      console.error(`[${serviceId}] Error type: ${error.constructor.name}`);
      console.error(`[${serviceId}] Error message: ${error.message}`);
      console.error(`[${serviceId}] Error code: ${error.code}`);
      console.error(`[${serviceId}] Error stack:`, error.stack);
      console.error(`[${serviceId}] === FIN ERROR ===`);
      throw new BadRequestException('Error al subir el archivo a S3');
    }
  }

  async getPresignedUploadUrl(fileName: string, category: string): Promise<{ uploadUrl: string, fileKey: string }> {
    const serviceId = `SERVICE-PRESIGNED-${Date.now()}`;
    console.log(`[${serviceId}] === getPresignedUploadUrl INICIO ===`);
    console.log(`[${serviceId}] Parámetros recibidos:`);
    console.log(`[${serviceId}]   - fileName: "${fileName}" (tipo: ${typeof fileName}, length: ${fileName?.length})`);
    console.log(`[${serviceId}]   - category: "${category}" (tipo: ${typeof category})`);

    try {
      console.log(`[${serviceId}] Validando fileName...`);
      if (!fileName || typeof fileName !== 'string') {
        console.error(`[${serviceId}] VALIDACIÓN FALLIDA: fileName inválido`);
        throw new BadRequestException('Nombre de archivo inválido o no proporcionado');
      }
      console.log(`[${serviceId}] ✓ fileName válido`);

      const timestamp = Date.now();
      console.log(`[${serviceId}] Timestamp generado: ${timestamp}`);

      console.log(`[${serviceId}] Extrayendo extensión de archivo...`);
      const fileExtension = fileName.split('.').pop();
      console.log(`[${serviceId}]   - Extensión: "${fileExtension}"`);

      console.log(`[${serviceId}] Sanitizando nombre de archivo...`);
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      console.log(`[${serviceId}]   - Original: "${fileName}"`);
      console.log(`[${serviceId}]   - Sanitizado: "${sanitizedFileName}"`);

      const s3Key = `soportes-de-interes/${category}/${timestamp}_${sanitizedFileName}`;
      console.log(`[${serviceId}]   - S3 Key final: "${s3Key}"`);

      console.log(`[${serviceId}] Determinando Content-Type...`);
      const contentType = this.getContentType(fileExtension);
      console.log(`[${serviceId}]   - Content-Type: "${contentType}"`);

      console.log(`[${serviceId}] Creando PutObjectCommand...`);
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
      });
      console.log(`[${serviceId}]   - Bucket: ${this.bucketName}`);
      console.log(`[${serviceId}]   - Encryption: AES256`);

      console.log(`[${serviceId}] Generando URL firmada (expira en 900s)...`);
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
      console.log(`[${serviceId}] ✓ URL firmada generada (length: ${uploadUrl.length})`);

      console.log(`[${serviceId}] === getPresignedUploadUrl FIN EXITOSO ===`);
      return { uploadUrl, fileKey: s3Key };
    } catch (error) {
      console.error(`[${serviceId}] === ERROR EN getPresignedUploadUrl ===`);
      console.error(`[${serviceId}] Error type: ${error.constructor.name}`);
      console.error(`[${serviceId}] Error message: ${error.message}`);
      console.error(`[${serviceId}] Error stack:`, error.stack);
      console.error(`[${serviceId}] === FIN ERROR ===`);
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