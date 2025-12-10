import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InspeccionReport } from '../../../database/entities/inspeccion-report.entity';

export interface InspeccionStatsResponse {
  total: number;
  abiertos: number;
  cerrados: number;
  por_tipo: { tipo: string; count: number }[];
  por_mes: { mes: string; count: number }[];
  tecnicas: number;
  auditorias: number;
}

export interface InspeccionProjectStatsResponse {
  proyecto_id: number;
  proyecto_nombre: string;
  total: number;
  abiertos: number;
  cerrados: number;
  tipos: { tipo: string; count: number }[];
}

@Injectable()
export class InspeccionesStatsService {
  constructor(
    @InjectRepository(InspeccionReport)
    private reportRepo: Repository<InspeccionReport>,
  ) {}

  /**
   * Obtiene resumen de estadísticas generales
   */
  async getSummary(): Promise<InspeccionStatsResponse> {
    const [
      totalResult,
      abiertosResult,
      cerradosResult,
      tecnicasResult,
      auditoriasResult,
      porTipoResult,
      porMesResult
    ] = await Promise.all([
      this.reportRepo.count(),
      this.reportRepo.count({ where: { estado: 'abierto' } }),
      this.reportRepo.count({ where: { estado: 'cerrado' } }),
      this.reportRepo.count({ where: { tipo: 'tecnica' } }),
      this.reportRepo.count({ where: { tipo: 'auditoria' } }),
      this.reportRepo
        .createQueryBuilder('r')
        .select('r.tipo as tipo, COUNT(*) as count')
        .groupBy('r.tipo')
        .getRawMany(),
      this.reportRepo
        .createQueryBuilder('r')
        .select("TO_CHAR(r.creado_en, 'YYYY-MM') as mes, COUNT(*) as count")
        .where("r.creado_en >= NOW() - INTERVAL '12 months'")
        .groupBy("TO_CHAR(r.creado_en, 'YYYY-MM')")
        .orderBy('mes', 'DESC')
        .getRawMany()
    ]);

    return {
      total: totalResult,
      abiertos: abiertosResult,
      cerrados: cerradosResult,
      tecnicas: tecnicasResult,
      auditorias: auditoriasResult,
      por_tipo: porTipoResult.map(r => ({ tipo: r.tipo, count: parseInt(r.count) })),
      por_mes: porMesResult.map(r => ({ mes: r.mes, count: parseInt(r.count) }))
    };
  }

  /**
   * Obtiene estadísticas agrupadas por proyecto
   */
  async getByProject(): Promise<InspeccionProjectStatsResponse[]> {
    const results = await this.reportRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.project', 'p')
      .select([
        'r.proyecto_id as proyecto_id',
        'p.name as proyecto_nombre',
        'COUNT(*) as total',
        "SUM(CASE WHEN r.estado = 'abierto' THEN 1 ELSE 0 END) as abiertos",
        "SUM(CASE WHEN r.estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados"
      ])
      .where('r.proyecto_id IS NOT NULL')
      .groupBy('r.proyecto_id, p.name')
      .orderBy('total', 'DESC')
      .getRawMany();

    const projectStats: InspeccionProjectStatsResponse[] = [];

    for (const result of results) {
      const tipos = await this.reportRepo
        .createQueryBuilder('r')
        .select('r.tipo as tipo, COUNT(*) as count')
        .where('r.proyecto_id = :pid', { pid: result.proyecto_id })
        .groupBy('r.tipo')
        .getRawMany();

      projectStats.push({
        proyecto_id: parseInt(result.proyecto_id),
        proyecto_nombre: result.proyecto_nombre || 'Sin nombre',
        total: parseInt(result.total),
        abiertos: parseInt(result.abiertos),
        cerrados: parseInt(result.cerrados),
        tipos: tipos.map(t => ({ tipo: t.tipo, count: parseInt(t.count) }))
      });
    }

    return projectStats;
  }

  /**
   * Obtiene tendencia de reportes en los últimos N días
   */
  async getTrend(days: number = 30): Promise<{ fecha: string; count: number }[]> {
    const results = await this.reportRepo
      .createQueryBuilder('r')
      .select("DATE(r.creado_en) as fecha, COUNT(*) as count")
      .where("r.creado_en >= NOW() - INTERVAL '1 day' * :days", { days })
      .groupBy('DATE(r.creado_en)')
      .orderBy('fecha', 'ASC')
      .getRawMany();

    return results.map(r => ({
      fecha: r.fecha,
      count: parseInt(r.count)
    }));
  }

  /**
   * Obtiene estadísticas por tipo de inspección
   */
  async getByTipo(): Promise<{ tipo: string; total: number; abiertos: number; cerrados: number }[]> {
    const results = await this.reportRepo
      .createQueryBuilder('r')
      .select([
        'r.tipo as tipo',
        'COUNT(*) as total',
        "SUM(CASE WHEN r.estado = 'abierto' THEN 1 ELSE 0 END) as abiertos",
        "SUM(CASE WHEN r.estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados"
      ])
      .groupBy('r.tipo')
      .getRawMany();

    return results.map(r => ({
      tipo: r.tipo,
      total: parseInt(r.total),
      abiertos: parseInt(r.abiertos),
      cerrados: parseInt(r.cerrados)
    }));
  }
}
