import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { IlvMaestrosService } from '../services/ilv-maestros.service';
import { CreateMaestroDto } from '../dto';

@Controller('ilv/maestros')
@UseGuards(JwtAuthGuard)
export class IlvMaestrosController {
  constructor(private maestrosService: IlvMaestrosService) { }

  // Rutas específicas primero (antes de las rutas con parámetros genéricos)
  @Get('subcategorias/:categoriaId')
  async getSubcategorias(@Param('categoriaId', ParseIntPipe) categoriaId: number) {
    return this.maestrosService.getSubcategorias(categoriaId);
  }

  @Get('subcategorias-by-clave/:clave')
  async getSubcategoriasByClave(@Param('clave') clave: string) {
    return this.maestrosService.getSubcategoriasByClave(clave);
  }

  // Rutas con parámetros genéricos después
  @Get(':tipo/tree')
  async getMaestrosTree(@Param('tipo') tipo: string) {
    return this.maestrosService.getMaestrosTree(tipo);
  }

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
