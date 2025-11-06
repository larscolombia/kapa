import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, Req, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { IlvReportsService } from '../services/ilv-reports.service';
import { CreateIlvReportDto, UpdateIlvReportDto, FilterIlvReportDto } from '../dto';
import { IlvOwnershipGuard } from '../guards';

@Controller('ilv/reports')
@UseGuards(JwtAuthGuard)
export class IlvReportsController {
  constructor(private reportsService: IlvReportsService) {}

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
