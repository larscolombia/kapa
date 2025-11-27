import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, Req, ParseIntPipe, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { IlvReportsService } from '../services/ilv-reports.service';
import { CreateIlvReportDto, UpdateIlvReportDto, FilterIlvReportDto } from '../dto';
import { IlvOwnershipGuard, IlvTokenGuard } from '../guards';

@Controller('ilv/reports')
@UseGuards(JwtAuthGuard)
export class IlvReportsController {
  constructor(private reportsService: IlvReportsService) { }

  @Post()
  async create(@Body() dto: CreateIlvReportDto, @Req() req) {
    const userId = req.user.user_id;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.reportsService.create(dto, userId, ip, userAgent);
  }

  @Get()
  async findAll(@Query() filters: FilterIlvReportDto, @Req() req) {
    const userId = req.user.user_id;
    return this.reportsService.findAll(filters, userId);
  }

  @Get('export/excel')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportExcel(@Query() filters: FilterIlvReportDto, @Req() req, @Res() res: Response) {
    const userId = req.user.user_id;
    const buffer = await this.reportsService.exportToExcel(filters, userId);

    const filename = `reportes_ilv_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('export/pdf')
  @Header('Content-Type', 'application/pdf')
  async exportPdf(@Query() filters: FilterIlvReportDto, @Req() req, @Res() res: Response) {
    const userId = req.user.user_id;
    const buffer = await this.reportsService.exportToPdf(filters, userId);

    const filename = `reportes_ilv_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('public/:id')
  @UseGuards(IlvTokenGuard)
  async findOnePublic(@Param('id', ParseIntPipe) id: number, @Query('token') token: string) {
    // Endpoint público para cierre de reportes vía token
    // Solo retorna datos readonly sin información sensible
    return this.reportsService.findOnePublic(id);
  }

  @Delete('bulk')
  async deleteBulk(@Body('ids') ids: number[], @Req() req) {
    const userId = req.user.user_id;
    // Manejar tanto role_id como role.role_id
    const roleId = req.user.role_id ?? req.user.role?.role_id;

    // Solo admin (role_id = 1) puede borrar reportes
    if (roleId !== 1) {
      throw new Error('Solo administradores pueden borrar reportes');
    }

    return this.reportsService.deleteBulk(ids, userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(IlvOwnershipGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIlvReportDto,
    @Req() req,
  ) {
    const userId = req.user.user_id;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.reportsService.update(id, dto, userId, ip, userAgent);
  }
}
