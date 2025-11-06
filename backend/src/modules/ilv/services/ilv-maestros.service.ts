import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IlbMaestro } from '../../../database/entities/ilv-maestro.entity';
import { CreateMaestroDto } from '../dto';

@Injectable()
export class IlbMaestrosService {
  constructor(
    @InjectRepository(IlbMaestro)
    private maestroRepo: Repository<IlbMaestro>,
  ) {}

  async findByTipo(tipo: string): Promise<IlbMaestro[]> {
    return this.maestroRepo.find({
      where: { tipo, activo: true },
      order: { orden: 'ASC', valor: 'ASC' },
    });
  }

  async create(dto: CreateMaestroDto): Promise<IlbMaestro> {
    const exists = await this.maestroRepo.findOne({
      where: { tipo: dto.tipo, clave: dto.clave },
    });

    if (exists) {
      throw new BadRequestException(`Ya existe un maestro con tipo '${dto.tipo}' y clave '${dto.clave}'`);
    }

    const maestro = this.maestroRepo.create(dto);
    return this.maestroRepo.save(maestro);
  }

  async update(id: number, dto: Partial<CreateMaestroDto>): Promise<IlbMaestro> {
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
}
