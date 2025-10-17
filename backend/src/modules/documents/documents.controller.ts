import {
  Controller,
  Get,
  BadRequestException,
  Param,
  Request,
  HttpException,
  Post,
  Body,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { DocumentService } from './documents.service';
import { Document } from '@entities/document.entity';

@Controller('document')
export class DocumentController {
  constructor(private DocumentService: DocumentService) { }
  @Get('/')
  async getDocuments() {
    try {
      const Documents = await this.DocumentService.getDocuments();
      return Documents;
    } catch (error) {
      throw new BadRequestException('Error al obtener los documentos');
    }
  }
  @Get('/:id')
  async getDocumentById(@Request() req) {
    try {
      const document = await this.DocumentService.getDocumentById(
        req.params.id,
      );
      return document;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }
  @Get('/subcriterion/:subcriterionId/project-contractor/:projectContractorId')
  async getDocumentsBySubcriterionId(
    @Param('subcriterionId') subcriterionId: number,
    @Param('projectContractorId') projectContractorId: number,
  ) {
    try {
      const documents = await this.DocumentService.getDocumentsBySubcriterionId(
        subcriterionId,
        projectContractorId,
      );
      return documents;
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener los documentos por subcriterio del proyecto',
      );
    }
  }
  @Get('employee/:employeeId')
  async getDocumentsByEmployeeId(@Param('employeeId') employeeId: number) {
    return this.DocumentService.getDocumentsByEmployeeId(employeeId);
  }
  @Get('/employee/:employeeId/subcriterion/:subcriterionId')
  async getDocumentsByEmployeeIdAndSubcriterionId(
    @Param('employeeId') employeeId: number,
    @Param('subcriterionId') subcriterionId: number,
  ) {
    try {
      const documents =
        await this.DocumentService.getDocumentsByEmployeeIdAndSubcriterionId(
          employeeId,
          subcriterionId,
        );
      return documents;
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener los documentos por empleado y subcriterio',
      );
    }
  }
  @Get('/by-project-contractor/:projectContractorId')
  async getDocumentsByProjectContractorIdAndState(
    @Param('projectContractorId') projectContractorId: number,
    @Query('state') state: string,
  ): Promise<Document[] | undefined> {
    try {
      return await this.DocumentService.getDocumentsByProjectContractorIdAndState(
        projectContractorId,
        state,
      );
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener los documentos por contractor y estado',
      );
    }
  }
  @Get('/by-project/:projectId')
  async getDocumentsByProjectId(@Param('projectId') projectId: number) {
    try {
      return await this.DocumentService.getDocumentsByProjectId(projectId);
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener los documentos por proyecto',
      );
    }
  }
  @Get('/by-contractor/:contractorId')
  async getDocumentsByContractorId(
    @Param('contractorId') contractorId: number,
  ) {
    try {
      return await this.DocumentService.getDocumentsByContractorId(
        contractorId,
      );
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener los documentos por contratista',
      );
    }
  }

  @Post('/')
  async postDocuments(@Body() documentData) {
    try {
      const documents = await this.DocumentService.create(documentData);
      return documents;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }
  @Post('/send-notification')
  async sendNotification(@Body() body): Promise<any> {
    try {
      const isSendNoti = await this.DocumentService.sendNotification(
        body.projectId,
        body.contractorId,
        body.email,
      );
      if (isSendNoti) {
        return {
          type: 'success',
          message: 'Se han enviado la notificación del cargue documental',
          title: 'Exito!',
        };
      } else {
        return {
          type: 'error',
          message: 'No se encuentran documentos cargados',
          title: 'Error!',
        };
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  @Put('/')
  async PutDocuments(@Body() documentData) {
    try {
      const documents = await this.DocumentService.update(documentData);
      return documents;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }
  @Delete('/:id')
  async deleteDocument(@Param('id') id: string) {
    try {
      const documentId = parseInt(id, 10);
      if (isNaN(documentId)) {
        throw new BadRequestException('El ID del documento no es válido');
      }
      await this.DocumentService.delete(documentId);
      return { message: 'Documento eliminado exitosamente' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException('Error al eliminar el documento');
      }
    }
  }

  @Post('/getDocumentsCloseToEndDate')
  async getDocumentsCloseToEndDate() {
    try {
      const Documents = await this.DocumentService.getDocumentsCloseToEndDate();
      return Documents;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al obtener los documentitos');
    }
  }

  @Put('/project-contractor/:project_contractor_id/uploaded-percentage')
  async updateUploadedPercentage(@Param('project_contractor_id') project_contractor_id: number) {
    try {
      return await this.DocumentService.updatePercentageByProjectContractor(project_contractor_id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al obtener los documentitos');
    }
  }

  @Put('/project-contractors/:project_contractor_id/uploaded-all-percentages')
  async updateUploadedPercentages(@Body() project_contractor_ids: number[]) {
    try {
      for (const project_contractor_id of project_contractor_ids) {
        await this.DocumentService.updatePercentageByProjectContractor(project_contractor_id);
      }
      return true;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al obtener los documentitos');
    }
  }
}
