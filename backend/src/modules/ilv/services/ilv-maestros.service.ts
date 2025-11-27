import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IlvMaestro } from '../../../database/entities/ilv-maestro.entity';
import { CreateMaestroDto } from '../dto';

@Injectable()
export class IlvMaestrosService {
  constructor(
    @InjectRepository(IlvMaestro)
    private maestroRepo: Repository<IlvMaestro>,
  ) { }

  async findByTipo(tipo: string): Promise<IlvMaestro[]> {
    return this.maestroRepo.find({
      where: { tipo, activo: true },
      order: { orden: 'ASC', valor: 'ASC' },
    });
  }

  async create(dto: CreateMaestroDto): Promise<IlvMaestro> {
    const exists = await this.maestroRepo.findOne({
      where: { tipo: dto.tipo, clave: dto.clave },
    });

    if (exists) {
      throw new BadRequestException(`Ya existe un maestro con tipo '${dto.tipo}' y clave '${dto.clave}'`);
    }

    const maestro = this.maestroRepo.create(dto);
    return this.maestroRepo.save(maestro);
  }

  async update(id: number, dto: Partial<CreateMaestroDto>): Promise<IlvMaestro> {
    const maestro = await this.maestroRepo.findOne({ where: { maestro_id: id } });

    if (!maestro) {
      throw new NotFoundException(`Maestro #${id} no encontrado`);
    }

    Object.assign(maestro, dto);
    maestro.updated_at = new Date();

    return this.maestroRepo.save(maestro);
  }

  async delete(id: number): Promise<void> {
    await this.update(id, { activo: false });
  }

  /**
   * Obtiene maestros en estructura de árbol jerárquico
   * @param tipo - Tipo base de maestros (ej: 'categoria_hid')
   * @returns Array de maestros con sus hijos anidados
   */
  async getMaestrosTree(tipo: string): Promise<any[]> {
    // Obtener todos los maestros activos del tipo padre
    const padres = await this.maestroRepo.find({
      where: { tipo, activo: true },
      order: { orden: 'ASC', valor: 'ASC' },
    });

    // Para cada padre, obtener sus hijos por clave usando aplica_a_tipo
    const tipoHijo = tipo === 'categoria_hid' ? 'subcategoria_hid' : null;

    if (!tipoHijo) {
      return padres;
    }

    const tree = await Promise.all(padres.map(async padre => {
      const children = await this.maestroRepo.find({
        where: {
          tipo: tipoHijo,
          aplica_a_tipo: padre.clave,
          activo: true
        },
        order: { orden: 'ASC', valor: 'ASC' },
      });

      return {
        ...padre,
        children
      };
    }));

    return tree;
  }

  /**
   * Obtiene subcategorías de una categoría específica por clave del padre
   * @param parentClave - Clave del maestro padre (ej: 'trabajos_alturas')
   * @returns Array de maestros hijos
   */
  async getSubcategoriasByClave(parentClave: string): Promise<IlvMaestro[]> {
    return this.maestroRepo.find({
      where: {
        tipo: 'subcategoria_hid',
        aplica_a_tipo: parentClave,
        activo: true
      },
      order: { orden: 'ASC', valor: 'ASC' },
    });
  }

  /**
   * Obtiene subcategorías de una categoría específica por ID del padre
   * @param categoriaId - ID del maestro padre
   * @returns Array de maestros hijos
   */
  async getSubcategorias(categoriaId: number): Promise<IlvMaestro[]> {
    // Primero obtener la clave del padre
    const padre = await this.maestroRepo.findOne({
      where: { maestro_id: categoriaId, activo: true }
    });

    if (!padre) {
      throw new NotFoundException(`Categoría #${categoriaId} no encontrada`);
    }

    return this.getSubcategoriasByClave(padre.clave);
  }

  /**
   * Obtiene todos los maestros activos (para mapeo de IDs a valores)
   */
  async findAll(): Promise<IlvMaestro[]> {
    return this.maestroRepo.find({
      where: { activo: true },
    });
  }
}
