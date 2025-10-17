import { Controller, Get, BadRequestException, Param } from '@nestjs/common';
import { CriterionService } from './criterion.service';

@Controller('criterion')
export class CriterionController {
  constructor(private CriterionService: CriterionService) {}
  @Get('/')
  async getCriterions() {
    try {
      const Criterions = await this.CriterionService.getCriterions();
      return Criterions;
    } catch (error) {
      throw new BadRequestException('Error al obtener los criterios');
    }
  }

  @Get('/:criterion_id')
  async getCriterionById(@Param('criterion_id') criterion_id: number) {
    try {
      const Criterion = await this.CriterionService.getCriterionById(criterion_id);
      return Criterion;
    } catch (error) {
      throw new BadRequestException('Error al obtener el criterio');
    }
  }

}
