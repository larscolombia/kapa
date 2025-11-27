import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupportsService } from './supports.service';
import { SupportFile } from '@entities/support-file.entity';
import { Public } from '@common/decorators/public.decorator';

@Controller('upload')
export class UploadController {
  constructor(private readonly supportsService: SupportsService) { }

  @Post('support-file')
  @Public()
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
      ];

      if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException('Tipo de archivo no permitido'), false);
      }
    }
  }))
  async uploadSupportFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { displayName: string; category: string; createdBy: string }
  ) {
    const requestId = `UPLOAD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[${requestId}] ========== INICIO UPLOAD SUPPORT FILE ==========`);
    console.log(`[${requestId}] Timestamp: ${new Date().toISOString()}`);
    console.log(`[${requestId}] Body recibido:`, JSON.stringify(body, null, 2));

    try {
      // Validación de archivo
      console.log(`[${requestId}] Validando presencia de archivo...`);
      if (!file) {
        console.error(`[${requestId}] ERROR: No se proporcionó archivo`);
        throw new BadRequestException('No se ha proporcionado ningún archivo');
      }

      console.log(`[${requestId}] Archivo recibido:`);
      console.log(`[${requestId}]   - Original name: ${file.originalname}`);
      console.log(`[${requestId}]   - MIME type: ${file.mimetype}`);
      console.log(`[${requestId}]   - Size (bytes): ${file.size}`);
      console.log(`[${requestId}]   - Size (MB): ${(file.size / (1024 * 1024)).toFixed(4)}`);
      console.log(`[${requestId}]   - Buffer length: ${file.buffer?.length || 'undefined'}`);

      // Subir a S3
      console.log(`[${requestId}] Iniciando subida a S3...`);
      console.log(`[${requestId}]   - Category: ${body.category}`);
      const s3Key = await this.supportsService.uploadFileToS3(
        file.buffer,
        file.originalname,
        body.category
      );
      console.log(`[${requestId}] ✓ S3 Upload exitoso. Key: ${s3Key}`);

      // Preparar datos para BD
      const fileSizeRounded = Math.round(file.size / (1024 * 1024));
      console.log(`[${requestId}] Preparando datos para BD:`);
      console.log(`[${requestId}]   - file.size original: ${file.size} bytes`);
      console.log(`[${requestId}]   - file.size / (1024*1024): ${file.size / (1024 * 1024)}`);
      console.log(`[${requestId}]   - Math.round(...): ${fileSizeRounded}`);

      const supportFileData: Partial<SupportFile> = {
        name: file.originalname,
        display_name: body.displayName,
        category: body.category,
        file_path: s3Key,
        file_size: fileSizeRounded,
        mime_type: file.mimetype,
        created_by_user: { user_id: parseInt(body.createdBy) } as any
      };

      console.log(`[${requestId}] Objeto supportFileData completo:`, JSON.stringify(supportFileData, null, 2));
      console.log(`[${requestId}]   - Tipo de file_size: ${typeof supportFileData.file_size}`);
      console.log(`[${requestId}]   - Valor de file_size: ${supportFileData.file_size}`);

      // Guardar en BD
      console.log(`[${requestId}] Iniciando guardado en BD...`);
      const savedFile = await this.supportsService.createSupportFile(supportFileData);
      console.log(`[${requestId}] ✓ BD Insert exitoso. ID: ${savedFile.support_file_id}`);
      console.log(`[${requestId}] Archivo guardado:`, JSON.stringify(savedFile, null, 2));

      console.log(`[${requestId}] ========== FIN EXITOSO ==========`);
      return {
        message: 'Archivo subido exitosamente',
        file: savedFile
      };
    } catch (error) {
      console.error(`[${requestId}] ========== ERROR CAPTURADO ==========`);
      console.error(`[${requestId}] Error type: ${error.constructor.name}`);
      console.error(`[${requestId}] Error message: ${error.message}`);
      console.error(`[${requestId}] Error stack:`, error.stack);

      if (error.code) {
        console.error(`[${requestId}] Error code: ${error.code}`);
      }
      if (error.driverError) {
        console.error(`[${requestId}] Driver error:`, error.driverError);
      }
      if (error.query) {
        console.error(`[${requestId}] Query ejecutado:`, error.query);
      }
      if (error.parameters) {
        console.error(`[${requestId}] Parámetros query:`, error.parameters);
      }

      console.error(`[${requestId}] ========== FIN ERROR ==========`);
      throw new BadRequestException('Error al subir el archivo: ' + error.message);
    }
  }

  @Post('generate-url')
  @Public()
  async generateUploadUrl(@Body() body: { fileName: string; category: string }) {
    const requestId = `GENURL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[${requestId}] ========== INICIO GENERATE URL ==========`);
    console.log(`[${requestId}] Body recibido:`, JSON.stringify(body, null, 2));
    console.log(`[${requestId}]   - fileName: "${body.fileName}" (tipo: ${typeof body.fileName})`);
    console.log(`[${requestId}]   - category: "${body.category}" (tipo: ${typeof body.category})`);

    try {
      console.log(`[${requestId}] Llamando a getPresignedUploadUrl...`);
      const { uploadUrl, fileKey } = await this.supportsService.getPresignedUploadUrl(
        body.fileName,
        body.category
      );
      console.log(`[${requestId}] ✓ URL generada exitosamente`);
      console.log(`[${requestId}]   - fileKey: ${fileKey}`);
      console.log(`[${requestId}]   - uploadUrl length: ${uploadUrl?.length || 'undefined'}`);
      console.log(`[${requestId}] ========== FIN EXITOSO ==========`);

      return { uploadUrl, fileKey };
    } catch (error) {
      console.error(`[${requestId}] ========== ERROR EN GENERATE URL ==========`);
      console.error(`[${requestId}] Error type: ${error.constructor.name}`);
      console.error(`[${requestId}] Error message: ${error.message}`);
      console.error(`[${requestId}] Error stack:`, error.stack);
      console.error(`[${requestId}] ========== FIN ERROR ==========`);
      throw new BadRequestException('Error al generar URL de subida');
    }
  }
}
