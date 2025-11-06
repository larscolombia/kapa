import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, Req, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { IlbReportsService } from '../services/ilv-reports.service';
import { CreateIlbReportDto, UpdateIlbReportDto, FilterIlbReportDto } from '../dto';
import { IlbOwnershipGuard } from '../guards';

@Controller('ilv/reports')
@UseGuards(JwtAuthGuard)
export class IlbReportsController {
  constructor(private reportsService: IlbReportsService) {}

  @Post()
  async create(@Body() dto: CreateIlbReportDto, @Req() req) {
    const userId = req.user.user_id;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    
    return this.reportsService.create(dto, userId, ip, userAgent);
  }

  @Get()
  async findAll(@Query() filters: FilterIlbReportDto, @Req() req) {
    const userId = req.user.user_id;
    return this.reportsService.findAll(filters, userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(IlbOwnershipGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIlbReportDto,
    @Req() req,
  ) {
    const userId = req.user.user_id;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    
    return this.reportsService.update(id, dto, userId, ip, userAgent);
  }
}
