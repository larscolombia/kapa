import { Controller, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { IlbReportsService } from '../services';
import { CloseIlbReportDto } from '../dto';
import { IlbTokenGuard } from '../guards';

@Controller('ilv/close')
export class IlbCloseController {
  constructor(private reportsService: IlbReportsService) {}

  @Post()
  @UseGuards(IlbTokenGuard)
  async closeReport(
    @Query('rid') reportId: string,
    @Body() dto: CloseIlbReportDto,
    @Req() req,
  ) {
    const id = parseInt(reportId);
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const jti = req.ilvToken.jti;

    return this.reportsService.close(id, dto, null, jti, ip, userAgent);
  }
}
