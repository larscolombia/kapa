import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { IlvMaestrosService } from '../services/ilv-maestros.service';
import { CreateMaestroDto } from '../dto';

@Controller('ilv/maestros')
@UseGuards(JwtAuthGuard)
export class IlvMaestrosController {
  constructor(private maestrosService: IlvMaestrosService) {}

  @Get(':tipo')
  async findByTipo(@Param('tipo') tipo: string) {
    return this.maestrosService.findByTipo(tipo);
  }

  @Post()
  async create(@Body() dto: CreateMaestroDto) {
    return this.maestrosService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateMaestroDto>,
  ) {
    return this.maestrosService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.maestrosService.delete(id);
    return { message: 'Maestro inactivado correctamente' };
  }
}
