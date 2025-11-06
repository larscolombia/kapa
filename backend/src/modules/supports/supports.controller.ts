import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
  UseGuards,
  HttpException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupportsService } from './supports.service';
import { SupportFile } from '@entities/support-file.entity';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';

@Controller('supports')
@UseGuards(JwtAuthGuard)
export class SupportsController {
  constructor(private readonly supportsService: SupportsService) { }

  @Public()
  @Get()
  async getSupportFiles(@Query('category') category?: string) {
    try {
      if (category) {
        return await this.supportsService.getSupportFilesByCategory(category);
      }
      return await this.supportsService.getSupportFiles();
    } catch (error) {
      throw new BadRequestException('Error al obtener los archivos de soporte');
    }
  }

  @Public()
  @Get('categories')
  async getCategories() {
    try {
      return await this.supportsService.getCategories();
    } catch (error) {
      throw new BadRequestException('Error al obtener las categorías');
    }
  }

  @Public()
  @Get('presigned-url/:fileKey(*)')
  async getPresignedUrl(
    @Param('fileKey') fileKey: string,
    @Query('disposition') disposition?: 'inline' | 'attachment'
  ) {
    try {
      // Decodificar el fileKey que viene URL encoded desde el frontend
      const decodedFileKey = decodeURIComponent(fileKey);
      const presignedUrl = await this.supportsService.getPresignedUrl(
        decodedFileKey,
        disposition || 'attachment'
      );
      return { url: presignedUrl };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Error al generar URL firmada');
    }
  }

  @Public()
  @Get('upload-url')
  async generateUploadUrl(@Query('fileName') fileName: string, @Query('category') category: string) {
    try {
      if (!fileName || !category) {
        throw new BadRequestException('fileName y category son requeridos');
      }
      const { uploadUrl, fileKey } = await this.supportsService.getPresignedUploadUrl(
        fileName,
        category
      );
      return { uploadUrl, fileKey };
    } catch (error) {
      throw new BadRequestException('Error al generar URL de subida');
    }
  }

  @Public()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { displayName: string; category: string; createdBy?: string }
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No se proporcionó archivo');
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
        created_by_user: body.createdBy ? { user_id: parseInt(body.createdBy) } as any : null
      };

      const savedFile = await this.supportsService.createSupportFile(supportFileData);

      return {
        success: true,
        message: 'Archivo subido exitosamente',
        file: savedFile
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new BadRequestException('Error al subir archivo: ' + error.message);
    }
  }

  @Public()
  @Get(':id')
  async getSupportFileById(@Param('id') id: string) {
    try {
      const supportFileId = parseInt(id, 10);
      if (isNaN(supportFileId)) {
        throw new BadRequestException('ID inválido');
      }
      return await this.supportsService.getSupportFileById(supportFileId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener el archivo de soporte');
    }
  }

  @Post()
  async createSupportFile(@Body() supportFileData: any) {
    try {
      // Si viene una solicitud de URL de subida (público)
      if (supportFileData.requestType === 'generateUploadUrl') {
        const { uploadUrl, fileKey } = await this.supportsService.getPresignedUploadUrl(
          supportFileData.fileName,
          supportFileData.category
        );
        return { uploadUrl, fileKey };
      }

      // Crear archivo de soporte normal
      return await this.supportsService.createSupportFile(supportFileData);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('generate-upload-url')
  @Public()
  async generateUploadUrlPublic(@Body() body: { fileName: string; category: string }) {
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

  @Put(':id')
  async updateSupportFile(
    @Param('id') id: string,
    @Body() supportFileData: Partial<SupportFile>,
  ) {
    try {
      const supportFileId = parseInt(id, 10);
      if (isNaN(supportFileId)) {
        throw new BadRequestException('ID inválido');
      }
      return await this.supportsService.updateSupportFile(
        supportFileId,
        supportFileData,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  async deleteSupportFile(@Param('id') id: string) {
    try {
      const supportFileId = parseInt(id, 10);
      if (isNaN(supportFileId)) {
        throw new BadRequestException('ID inválido');
      }
      await this.supportsService.deleteSupportFile(supportFileId);
      return { message: 'Archivo de soporte eliminado exitosamente' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar el archivo de soporte');
    }
  }
}
