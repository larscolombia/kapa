import {
  Controller,
  Get,
  Request,
  BadRequestException,
  HttpException,
  Body,
  Post,
  Put,
} from '@nestjs/common';
import { ContractorsService } from './contractors.service';

@Controller('contractors')
export class ContractorsController {
  constructor(private contractorsService: ContractorsService) { }
  @Get('/')
  async getContractors() {
    try {
      const contractors =
        await this.contractorsService.getContractorsResponseDto();
      return contractors;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }
  @Get('/:id')
  async getContractor(@Request() req) {
    try {
      const contractor = await this.contractorsService.getContractorResponseDto(
        req.params.id,
      );
      return contractor;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  @Post('/')
  async postContractors(@Body() contractorData) {
    try {
      const contractors = await this.contractorsService.create(contractorData);
      return contractors;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  @Put('/')
  async PutContractors(@Body() contractorData) {
    try {
      const contractors = await this.contractorsService.update(contractorData);
      return contractors;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  @Post('/send-results/')
  async sendResults(@Body() body) {
    try {
      const result = await this.contractorsService.sendResults(
        body.projectId,
        body.contractorId,
        body.email,
      );
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  @Get('/:id/projects')
  async getProjects(@Request() req) {
    try {
      const projects = await this.contractorsService.getProjectsByContractor(req.params.id);
      return projects;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  @Get('/:id/subContractors')
  async getSubContractors(@Request() req) {
    try {
      const subContractors = await this.contractorsService.getSubContractorsByParentContractorId(req.params.id);
      return subContractors;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }
}
