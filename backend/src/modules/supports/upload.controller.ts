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
  constructor(private readonly supportsService: SupportsService) {}

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
    try {
      if (!file) {
        throw new BadRequestException('No se ha proporcionado ningún archivo');
      }

      const s3Key = await this.supportsService.uploadFileToS3(
        file.buffer,
        file.originalname,
        body.category
      );

      const supportFileData: Partial<SupportFile> = {
        name: file.originalname,
        display_name: body.displayName,
        category: body.category,
        file_path: s3Key,
        file_size: file.size / (1024 * 1024),
        mime_type: file.mimetype,
        created_by_user: { user_id: parseInt(body.createdBy) } as any
      };

      const savedFile = await this.supportsService.createSupportFile(supportFileData);
      
      return {
        message: 'Archivo subido exitosamente',
        file: savedFile
      };
    } catch (error) {
      console.error('Error uploading support file:', error);
      throw new BadRequestException('Error al subir el archivo: ' + error.message);
    }
  }

  @Post('generate-url')
  @Public()
  async generateUploadUrl(@Body() body: { fileName: string; category: string }) {
    try {
      const { uploadUrl, fileKey } = await this.supportsService.getPresignedUploadUrl(
        body.fileName,
        body.category
      );
      return { uploadUrl, fileKey };
    } catch (error) {
      throw new BadRequestException('Error al generar URL de subida');
    }
  }
}
