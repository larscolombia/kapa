import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IlbReport } from '../../../database/entities/ilv-report.entity';
import { IlbReportField } from '../../../database/entities/ilv-report-field.entity';
import { IlbAttachment } from '../../../database/entities/ilv-attachment.entity';
import { IlbAudit } from '../../../database/entities/ilv-audit.entity';
import { CreateIlbReportDto, IlbReportType } from '../dto/create-ilv-report.dto';
import { UpdateIlbReportDto } from '../dto/update-ilv-report.dto';
import { CloseIlbReportDto } from '../dto/close-ilv-report.dto';
import { FilterIlbReportDto } from '../dto/filter-ilv-report.dto';
import { FieldMapper } from '../utils/field-mapper.util';
import { IlbValidators } from '../utils/validators.util';
import { IlbAuthService } from './ilv-auth.service';
import { IlbNotificationsService } from './ilv-notifications.service';

@Injectable()
export class IlbReportsService {
  constructor(
    @InjectRepository(IlbReport)
    private reportRepo: Repository<IlbReport>,
    @InjectRepository(IlbReportField)
    private fieldRepo: Repository<IlbReportField>,
    @InjectRepository(IlbAudit)
    private auditRepo: Repository<IlbAudit>,
    private authService: IlbAuthService,
    private notificationService: IlbNotificationsService,
  ) {}

  async create(dto: CreateIlbReportDto, userId: number, ip: string, ua: string): Promise<IlbReport> {
    const fieldsMap = dto.fields.reduce((acc, f) => ({ ...acc, [f.key]: f.value }), {});
    
    IlbValidators.validateRequiredFields(dto.tipo, fieldsMap);
    IlbValidators.validateBusinessRules(dto.tipo, fieldsMap);

    const report = this.reportRepo.create({
      tipo: dto.tipo,
      centro_id: dto.centro_id,
      proyecto_id: dto.proyecto_id,
      cliente_id: dto.cliente_id,
      empresa_id: dto.empresa_id,
      creado_por: userId,
      propietario_user_id: userId,
      estado: 'abierto',
    });

    const savedReport = await this.reportRepo.save(report);

    const fields = dto.fields.map(f => this.fieldRepo.create({
      report_id: savedReport.report_id,
      key: f.key,
      value: f.value,
      value_type: f.value_type || 'string',
    }));

    await this.fieldRepo.save(fields);

    await this.audit('create', savedReport.report_id, userId, null, ip, ua);

    const token = await this.authService.generateCloseToken(
      savedReport.report_id,
      dto.empresa_id,
    );

    await this.notificationService.sendReportCreatedEmail(savedReport, token);

    return this.findOne(savedReport.report_id);
  }

  async findAll(filters: FilterIlbReportDto, userId: number): Promise<{ data: IlbReport[]; total: number }> {
    const qb = this.reportRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.fields', 'fields')
      .leftJoinAndSelect('r.project', 'project')
      .leftJoinAndSelect('r.client', 'client')
      .leftJoinAndSelect('r.contractor', 'contractor');

    if (filters.tipo) qb.andWhere('r.tipo = :tipo', { tipo: filters.tipo });
    if (filters.estado) qb.andWhere('r.estado = :estado', { estado: filters.estado });
    if (filters.proyecto_id) qb.andWhere('r.proyecto_id = :pid', { pid: filters.proyecto_id });
    if (filters.cliente_id) qb.andWhere('r.cliente_id = :cid', { cid: filters.cliente_id });
    if (filters.empresa_id) qb.andWhere('r.empresa_id = :eid', { eid: filters.empresa_id });
    
    if (filters.fecha_desde) {
      qb.andWhere('r.creado_en >= :desde', { desde: filters.fecha_desde });
    }
    if (filters.fecha_hasta) {
      qb.andWhere('r.creado_en <= :hasta', { hasta: filters.fecha_hasta });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    
    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('r.creado_en', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    
    return { data, total };
  }

  async findOne(id: number): Promise<IlbReport> {
    const report = await this.reportRepo.findOne({
      where: { report_id: id },
      relations: ['fields', 'project', 'client', 'contractor', 'creator', 'owner'],
    });

    if (!report) {
      throw new NotFoundException(`Reporte ILV #${id} no encontrado`);
    }

    return report;
  }

  async update(id: number, dto: UpdateIlbReportDto, userId: number, ip: string, ua: string): Promise<IlbReport> {
    const report = await this.findOne(id);

    if (report.propietario_user_id !== userId) {
      throw new ForbiddenException('Solo el propietario puede editar el reporte');
    }

    if (report.estado !== 'abierto') {
      throw new BadRequestException('Solo se pueden editar reportes abiertos');
    }

    if (dto.fields) {
      await this.fieldRepo.delete({ report_id: id });
      
      const newFields = dto.fields.map(f => this.fieldRepo.create({
        report_id: id,
        key: f.key,
        value: f.value,
        value_type: f.value_type || 'string',
      }));
      
      await this.fieldRepo.save(newFields);
    }

    report.actualizado_en = new Date();
    await this.reportRepo.save(report);

    await this.audit('update', id, userId, dto, ip, ua);

    return this.findOne(id);
  }

  async close(id: number, dto: CloseIlbReportDto, userId: number | null, jti: string, ip: string, ua: string): Promise<IlbReport> {
    const report = await this.findOne(id);

    if (report.estado === 'cerrado') {
      throw new BadRequestException('El reporte ya está cerrado');
    }

    const fieldsMap = { plan_accion: dto.plan_accion, ...dto };
    IlbValidators.validateCloseFields(report.tipo as IlbReportType, fieldsMap);

    await this.fieldRepo.save([
      this.fieldRepo.create({ report_id: id, key: 'plan_accion', value: dto.plan_accion }),
      ...(dto.evidencia_cierre ? [this.fieldRepo.create({ report_id: id, key: 'evidencia_cierre', value: dto.evidencia_cierre })] : []),
      ...(dto.fecha_implantacion ? [this.fieldRepo.create({ report_id: id, key: 'fecha_implantacion', value: dto.fecha_implantacion })] : []),
    ]);

    report.estado = 'cerrado';
    report.fecha_cierre = new Date();
    report.cerrado_por = userId;

    await this.reportRepo.save(report);
    await this.authService.markTokenAsUsed(jti, ip, ua);
    await this.audit('close', id, userId, dto, ip, ua);
    await this.notificationService.sendReportClosedEmail(report);

    return this.findOne(id);
  }

  private async audit(action: string, reportId: number, userId: number | null, data: any, ip: string, ua: string): Promise<void> {
    await this.auditRepo.save({
      entidad: 'ilv_report',
      entidad_id: reportId,
      accion: action,
      actor_id: userId,
      diff_json: data,
      ip,
      user_agent: ua,
    });
  }
}
