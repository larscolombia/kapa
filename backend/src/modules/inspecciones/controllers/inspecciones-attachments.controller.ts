import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { InspeccionesAttachmentsService } from '../services/inspecciones-attachments.service';

@Controller('inspecciones/:reportId/attachments')
@UseGuards(JwtAuthGuard)
export class InspeccionesAttachmentsController {
  constructor(private attachmentsService: InspeccionesAttachmentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }))
  async uploadAttachment(
    @Param('reportId', ParseIntPipe) reportId: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const userId = req.user.user_id;

    return this.attachmentsService.uploadAttachment(reportId, file, userId);
  }

  @Get()
  async getAttachments(@Param('reportId', ParseIntPipe) reportId: number) {
    return this.attachmentsService.getAttachmentsWithUrls(reportId);
  }

  @Get(':attachmentId')
  async getAttachment(
    @Param('reportId', ParseIntPipe) reportId: number,
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
  ) {
    return this.attachmentsService.getAttachment(reportId, attachmentId);
  }

  @Get(':attachmentId/download')
  async getDownloadUrl(
    @Param('reportId', ParseIntPipe) reportId: number,
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @Query('disposition') disposition?: 'inline' | 'attachment',
  ) {
    const url = await this.attachmentsService.getPresignedUrl(
      reportId,
      attachmentId,
      disposition || 'attachment',
    );
    return { url };
  }

  @Delete(':attachmentId')
  async deleteAttachment(
    @Param('reportId', ParseIntPipe) reportId: number,
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @Req() req,
  ) {
    const userId = req.user.user_id;
    const roleId = req.user.role_id ?? req.user.role?.role_id;
    return this.attachmentsService.deleteAttachment(reportId, attachmentId, userId, roleId);
  }
}
