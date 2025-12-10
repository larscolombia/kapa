import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { 
  InspeccionesStatsService, 
  InspeccionStatsResponse, 
  InspeccionProjectStatsResponse 
} from '../services/inspecciones-stats.service';

@Controller('inspecciones/stats')
@UseGuards(JwtAuthGuard)
export class InspeccionesStatsController {
  constructor(private readonly statsService: InspeccionesStatsService) {}

  /**
   * Obtener resumen de estadísticas
   * GET /api/inspecciones/stats/summary
   */
  @Get('summary')
  async getSummary(): Promise<InspeccionStatsResponse> {
    return this.statsService.getSummary();
  }

  /**
   * Obtener estadísticas por proyecto
   * GET /api/inspecciones/stats/by-project
   */
  @Get('by-project')
  async getByProject(): Promise<InspeccionProjectStatsResponse[]> {
    return this.statsService.getByProject();
  }

  /**
   * Obtener tendencia de reportes
   * GET /api/inspecciones/stats/trend?days=30
   */
  @Get('trend')
  async getTrend(@Query('days') days?: number): Promise<{ fecha: string; count: number }[]> {
    const daysNumber = days ? parseInt(days.toString()) : 30;
    return this.statsService.getTrend(daysNumber);
  }

  /**
   * Obtener estadísticas por tipo de inspección
   * GET /api/inspecciones/stats/by-tipo
   */
  @Get('by-tipo')
  async getByTipo(): Promise<{ tipo: string; total: number; abiertos: number; cerrados: number }[]> {
    return this.statsService.getByTipo();
  }
}
