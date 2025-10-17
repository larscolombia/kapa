import { Controller, Get, BadRequestException, Param } from '@nestjs/common';
import { SubCriterionService } from './subcriterion.service';

@Controller('subcriterion')
export class SubCriterionController {
  constructor(private SubCriterionService: SubCriterionService) {}
  @Get('/')
  async getSubCriterions() {
    try {
      const SubCriterions = await this.SubCriterionService.getSubCriterions();
      return SubCriterions;
    } catch (error) {
      throw new BadRequestException('Error al obtener los subcriterios');
    }
  }
  @Get('/by-criterion-id/:idcriterion')
  async getSubCriterionsByCriterionId(@Param('idcriterion') id: string) {
    try {
      const criterionId = parseInt(id, 10);
      if (isNaN(criterionId)) {
        throw new BadRequestException(
          'El ID del criterio del proyecto no es válido',
        );
      }
      const SubCriterions =
        await this.SubCriterionService.getSubCriterionsByCriterionId(
          criterionId,
        );
      return SubCriterions;
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener los subcriterios del criterio',
      );
    }
  }
  @Get('/employee-required')
  async getSubCriterionsWithEmployeeRequired() {
    try {
      const subCriterions =
        await this.SubCriterionService.getSubCriterionsWithEmployeeRequired();
      return subCriterions;
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener los subcriterios que requieren empleado',
      );
    }
  }
}
