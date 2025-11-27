import { Controller, Get, Query } from '@nestjs/common';
import { IlvStatsService, StatsResponse, ProjectStatsResponse } from '../services/ilv-stats.service';

@Controller('ilv/stats')
export class IlvStatsController {
  constructor(private readonly statsService: IlvStatsService) { }

  @Get('summary')
  async getSummary(): Promise<StatsResponse> {
    return this.statsService.getSummary();
  }

  @Get('by-project')
  async getByProject(): Promise<ProjectStatsResponse[]> {
    return this.statsService.getByProject();
  }

  @Get('trend')
  async getTrend(@Query('days') days?: number): Promise<{ fecha: string; count: number }[]> {
    const daysNumber = days ? parseInt(days.toString()) : 30;
    return this.statsService.getTrend(daysNumber);
  }
}
