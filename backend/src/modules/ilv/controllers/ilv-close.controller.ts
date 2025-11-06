import { Controller, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { IlvReportsService } from '../services';
import { CloseIlvReportDto } from '../dto';
import { IlvTokenGuard } from '../guards';

@Controller('ilv/close')
export class IlvCloseController {
  constructor(private reportsService: IlvReportsService) {}

  @Post()
  @UseGuards(IlvTokenGuard)
  async closeReport(
    @Query('rid') reportId: string,
    @Body() dto: CloseIlvReportDto,
    @Req() req,
  ) {
    const id = parseInt(reportId);
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const jti = req.ilvToken.jti;

    return this.reportsService.close(id, dto, null, jti, ip, userAgent);
  }
}
