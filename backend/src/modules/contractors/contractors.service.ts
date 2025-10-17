import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Contractor } from '@entities/contractor.entity';
import { ContractorDto } from './dto/contractor.dto';
import { ContractorEmail } from '@entities/contractor-email.entity';
import { Project } from '@entities/project.entity';
import { ProjectContractor } from '@entities/project-contractor.entity';
import { ProjectContractorsService } from '../project-contractors/project-contractors.service';
import { ProjectContractorCriterionsService } from '../project-contractor-criterions/project-contractor-criterions.service';
import { MailUtil } from '@common/utils/mail.util';

@Injectable()
export class ContractorsService {
  constructor(
    @InjectRepository(Contractor)
    private readonly contractorsRepository: Repository<Contractor>,

    @InjectRepository(ContractorEmail)
    private readonly contractorEmailRepository: Repository<ContractorEmail>,

    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,

    @InjectRepository(ProjectContractor)
    private readonly projectContractorRepository: Repository<ProjectContractor>,
    private projectContractorService: ProjectContractorsService,
    private projectContractorCriterionsService: ProjectContractorCriterionsService,
  ) { }

  private MAX_SUBCONTRACTORS = 5;

  async create(dto: ContractorDto): Promise<Contractor> {
    const { emails, projectIds, ...contractorData } = dto;
    // validaciones sobre contratista
    if (contractorData.parent_contractor != null) {
      await this.validateMaxSubcontractors(contractorData);
    }
    await this.validateContractorRequiredFields(contractorData);
    await this.validateStateEnum(contractorData.state);
    await this.validateEmails(emails);
    // Crear Contratista
    const contractor = this.contractorsRepository.create(contractorData);
    await this.contractorsRepository.save(contractor);
    // Crear y asociar correos electrónicos
    const contractorEmails = emails.map((email) =>
      this.contractorEmailRepository.create({ email, contractor }),
    );
    await this.contractorEmailRepository.save(contractorEmails);
    // Asociar proyectos
    const projectContractors = await Promise.all(
      projectIds.map(async (projectId) => {
        const project = await this.projectsRepository.findOne({
          where: { project_id: projectId },
        });
        return this.projectContractorRepository.create({ project, contractor });
      }),
    );
    await this.projectContractorRepository.save(projectContractors);
    return contractor;
  }

  async update(dto: ContractorDto): Promise<Contractor> {
    const { contractor_id } = dto;
    const contractor = await this.contractorsRepository.findOne({
      where: { contractor_id },
      relations: ['emails', 'projectContractors'],
    });
    if (!contractor) {
      throw new Error('El contratista no existe');
    }
    const { emails, projectIds, ...contractorData } = dto;
    // validaciones sobre contratista
    if (contractorData.parent_contractor != null) {
      await this.validateMaxSubcontractors(contractorData);
    }
    await this.validateContractorRequiredFields(contractorData, true);
    await this.validateStateEnum(contractorData.state);
    await this.validateEmails(emails);
    // Actualizar datos del contratista
    this.contractorsRepository.merge(contractor, contractorData);
    await this.contractorsRepository.save(contractor);
    // Actualizar correos electrónicos
    await this.contractorEmailRepository.delete({
      contractor: { contractor_id },
    });
    const contractorEmails = emails.map((email) =>
      this.contractorEmailRepository.create({ email, contractor }),
    );
    await this.contractorEmailRepository.save(contractorEmails);
    // Manejo de ProjectContractors
    const currentProjectContractors = contractor.projectContractors;
    // Identificar relaciones a mantener y nuevas relaciones a agregar
    const projectContractorsToKeep = currentProjectContractors.filter((pc) =>
      projectIds.includes(pc.project.project_id),
    );
    const projectIdsToAdd = projectIds.filter(
      (projectId) =>
        !currentProjectContractors.some(
          (pc) => pc.project.project_id === projectId,
        ),
    );
    // Identificar relaciones a eliminar
    const projectContractorsToRemove = currentProjectContractors.filter(
      (pc) => !projectIds.includes(pc.project.project_id),
    );
    // Verificar dependencias antes de eliminar
    for (const projectContractor of projectContractorsToRemove) {
      await this.projectContractorService.checkProjectContractorDependencies(
        projectContractor.project_contractor_id,
      );
      await this.projectContractorRepository.remove(projectContractor);
    }
    // Agregar nuevos ProjectContractors
    const newProjectContractors = await Promise.all(
      projectIdsToAdd.map(async (projectId) => {
        const project = await this.projectsRepository.findOne({
          where: { project_id: projectId },
        });
        return this.projectContractorRepository.create({ project, contractor });
      }),
    );
    // Guardar los ProjectContractors actualizados y nuevos
    await this.projectContractorRepository.save([
      ...projectContractorsToKeep,
      ...newProjectContractors,
    ]);
    return contractor;
  }

  async getContractorsResponseDto(): Promise<ContractorDto[] | undefined> {
    const contractors = (await this.contractorsRepository.find({ where: { parent_contractor: IsNull() } })).sort(
      (a, b) => a.contractor_id - b.contractor_id,
    );
    return contractors.map((contractor) => this.mapContractorToDto(contractor));
  }

  async getSubContractorsByParentContractorId(parentContractorId: number): Promise<ContractorDto[] | undefined> {
    const contractors = (await this.contractorsRepository.find({ where: { parent_contractor: parentContractorId } })).sort(
      (a, b) => a.contractor_id - b.contractor_id,
    );
    return contractors.map((contractor) => this.mapContractorToDto(contractor));
  }

  private extractEmails(emails: ContractorEmail[]): string[] {
    return emails.map((emailObj) => emailObj.email);
  }

  private extractProjectIds(projectContractors: ProjectContractor[]): number[] {
    return projectContractors.map(
      (projectContractor) => projectContractor.project.project_id,
    ) || [];
  }

  private mapContractorToDto(contractor: Contractor): ContractorDto {
    return {
      ...contractor,
      emails: this.extractEmails(contractor.emails),
      projectIds: this.extractProjectIds(contractor.projectContractors),
    };
  }

  async getProjectsByContractor(contractorId: number): Promise<Project[]> {
    const projects = await this.projectsRepository.find({
      where: { projectContractors: { contractor: { contractor_id: contractorId } } },
    });
    return projects;
  }

  async getContractorResponseDto(
    contractorId: number,
  ): Promise<ContractorDto | undefined> {
    const contractor = await this.contractorsRepository.findOneBy({
      contractor_id: contractorId,
    });
    if (!contractor) throw new NotFoundException('El proyecto no existe');
    const contractorResponseDto = new ContractorDto();
    Object.assign(contractorResponseDto, contractor);
    contractorResponseDto.emails = contractor.emails.map(
      (emailObj) => emailObj.email,
    );
    contractorResponseDto.projectIds =
      contractor.projectContractors.map(
        (projectContractor) => projectContractor.project.project_id,
      ) || [];
    return contractorResponseDto;
  }

  async validateContractorRequiredFields(contractorData, isUpdate = false) {
    if (!contractorData.contractor_id && isUpdate)
      throw new BadRequestException(
        'El identificador del proyecto es requerido',
      );
    if (!contractorData.nit)
      throw new BadRequestException('El NIT del proyecto es requerido');
    if (!contractorData.name)
      throw new BadRequestException('El nombre del proyecto es requerido');
    if (!contractorData.resident_engineer)
      throw new BadRequestException(
        'El ingeniero residente del proyecto es requerido',
      );
    if (!contractorData.coordinator)
      throw new BadRequestException('El coordinador es requerido');
    if (!contractorData.phone)
      throw new BadRequestException('El telefono es requerido');
    if (!contractorData.state)
      throw new BadRequestException('El estado del proyecto es requerido');
  }

  async validateStateEnum(state: string): Promise<void> {
    if (!['active', 'inactive'].includes(state)) {
      throw new Error('El estado debe ser activo o inactivo');
    }
  }

  async validateEmails(emails: string[]): Promise<void> {
    if (emails.length === 0) throw new Error('Debe agregar al menos un correo');
    if (
      emails.some(
        (email) =>
          !email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      )
    )
      throw new Error('Formato de correo inválido');
    if (new Set(emails).size !== emails.length)
      throw new Error('No se permiten correos duplicados');
  }

  async getContractorsByEmail(
    email: string,
  ): Promise<Contractor[] | undefined> {
    const contractors = await this.contractorsRepository
      .createQueryBuilder('contractor')
      .leftJoinAndSelect('contractor.emails', 'email')
      .where('email.email = :email', { email: email })
      .getMany();
    if (contractors.length === 0)
      throw new NotFoundException(
        'No existe ningun contratista que tenga este correo electronico registrado',
      );
    return contractors;
  }

  async getContractorsByProjectIdAndEmail(
    projectId: number,
    email: string,
    roleId: number, // Añadimos roleId como argumento
  ): Promise<any[] | undefined> {
    const contractorsQuery = this.contractorsRepository
      .createQueryBuilder('contractor')
      .leftJoinAndSelect('contractor.emails', 'email')
      .leftJoinAndSelect('contractor.projectContractors', 'projectContractor')
      .where('projectContractor.project = :projectId', { projectId: projectId })
      .andWhere('email.email = :email', { email: email })
      .andWhere('contractor.state = :state', { state: 'active' });

    // Ajuste adicional para limitar resultados según el roleId
    if (roleId === 5) {
      // Subcontratistas solo pueden ver subcontratistas
      contractorsQuery.andWhere('contractor.parent_contractor IS NOT NULL');
    }

    const contractors = await contractorsQuery.getMany();

    if (contractors.length === 0) {
      throw new NotFoundException(
        'No existe ningún contratista o subcontratista con este correo electrónico registrado para este proyecto',
      );
    }

    const contractorDto = await Promise.all(
      contractors.map(async (contractor) => {
        const completitionPercentage =
          await this.projectContractorService.getProjectContractorPercentageByContractorIdAndProjectId(
            contractor.contractor_id,
            projectId,
          );

        return {
          ...contractor,
          completition_percentage: completitionPercentage,
        };
      }),
    );

    return contractorDto;
  }

  async getContractorsByProjectId(
    projectId: number,
    roleId: number,
  ): Promise<any[] | undefined> {
    const contractorsQuery = await this.contractorsRepository
      .createQueryBuilder('contractor')
      .leftJoinAndSelect('contractor.projectContractors', 'projectContractor')
      .where('projectContractor.project = :projectId', { projectId: projectId });

    // Ajustar el filtro para que si es un cliente solo muestre contratistas activos
    if (roleId === 4) {
      contractorsQuery.andWhere('contractor.state = :state', { state: 'active' });
    }

    const contractors = await contractorsQuery.getMany();

    if (contractors.length === 0)
      throw new NotFoundException(
        'No existe ningun contratista registrado para este proyecto',
      );
    const contractorDto = await Promise.all(
      contractors.map(async (contractor) => {
        const completitionPercentage =
          await this.projectContractorService.getProjectContractorPercentageByContractorIdAndProjectId(
            contractor.contractor_id,
            projectId,
          );

        return {
          ...contractor,
          completition_percentage: completitionPercentage,
        };
      }),
    );
    return contractorDto;
  }

  async sendResults(
    projectId: number,
    contractorId: number,
    email: string,
  ): Promise<void> {
    console.log('Enviando resultados');
    const projectContractor =
      await this.projectContractorService.getProjectContractorByContractorIdAndProjectId(
        contractorId,
        projectId,
      );
    if (!projectContractor)
      throw new NotFoundException(
        'No existe ningun contratista registrado para este proyecto',
      );
    const criterions =
      await this.projectContractorCriterionsService.getProjectContractorCriterionsByContractorIdAndProjectId(
        projectContractor.contractor.contractor_id,
        projectContractor.project.project_id,
      );
    const emails = projectContractor.contractor.emails.map(
      (email) => email.email,
    );
    const htmlContent = this.generateHtmlReport(
      projectContractor.project,
      projectContractor.contractor,
      criterions,
      projectContractor.completition_percentage,
    );
    // Enviar el correo electrónico usando la utilidad MailUtil
    await MailUtil.sendMail({
      to: email,
      cc: emails,
      subject:
        'Resumen del estado del proyecto: ' + projectContractor.project.name,
      html: htmlContent,
    });
  }

  generateHtmlReport(project, contractor, criterions, completition_percentage) {
    let criterionRows = '';
    criterions.forEach((criterion) => {
      const approvalColor = this.getApprovalColor(criterion.approvalPercentage);

      criterionRows += `
            <tr>
                <td>${criterion.name}</td>
                <td>${criterion.documentType.name}</td>
                <td>
                    <div class="progress-bar">
                        <div class="approval-percentage" style="width: ${criterion.approvalPercentage}%; color: white; background-color: ${approvalColor};">
                            ${criterion.approvalPercentage}%
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    // Construir el HTML completo
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Resumen de Proyecto</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    width: 80%;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #333333;
                }
                .project-info, .criterion-info {
                    margin-bottom: 20px;
                }
                .project-info p, .criterion-info p {
                    margin: 5px 0;
                    font-size: 14px;
                    color: #555555;
                }
                .progress-bar {
                    background-color: #e0e0e0;
                    border-radius: 8px;
                    overflow: hidden;
                    margin-top: 5px;
                    height: 24px;
                    width: 100%;
                }
                .progress-bar div {
                    height: 100%;
                    text-align: center;
                    color: #ffffff;
                    line-height: 24px;
                    border-radius: 8px;
                }
                .completion-percentage {
                    background-color: #4caf50;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                table th, table td {
                    padding: 12px;
                    border: 1px solid #dddddd;
                    text-align: left;
                }
                table th {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Informe de Estado del Proyecto</h1>
                
                <div class="project-info">
                    <h2>Proyecto: ${project.name}</h2>
                    <p><strong>Dirección:</strong> ${project.address}</p>
                    <p><strong>Supervisor:</strong> ${project.supervisor}</p>
                    <p><strong>Fecha de Inicio:</strong> ${project.start_date}</p>
                    <p><strong>Fecha de Fin:</strong> ${project.end_date}</p>
                </div>

                <div class="contractor-info">
                    <h2>Contratista: ${contractor.name}</h2>
                    <p><strong>Ingeniero Residente:</strong> ${contractor.resident_engineer}</p>
                    <p><strong>Coordinador:</strong> ${contractor.coordinator}</p>
                    <p><strong>Teléfono:</strong> ${contractor.phone}</p>
                </div>

                <div class="project-status">
                    <h2>Estado Actual del Proyecto</h2>
                    <p><strong>Porcentaje de Completitud:</strong> ${completition_percentage}%</p>
                    <div class="progress-bar">
                        <div class="completion-percentage" style="width: ${completition_percentage}%; color: white;">
                            ${completition_percentage}%
                        </div>
                    </div>
                </div>

                <div class="criterion-info">
                    <h2>Criterios del Proyecto</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Criterio</th>
                                <th>Tipo de Documento</th>
                                <th>Porcentaje de Aprobación</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${criterionRows}
                        </tbody>
                    </table>
                </div>
            </div>
        </body>
        </html>
    `;
    return htmlContent;
  }

  getApprovalColor(approvalPercentage) {
    if (approvalPercentage >= 100) {
      return '#4caf50'; // Verde
    } else if (approvalPercentage >= 50) {
      return '#ffeb3b'; // Amarillo
    } else {
      return '#f44336'; // Rojo
    }
  }

  async validateMaxSubcontractors(subContractor) {
    const totalSubcontractors = await this.contractorsRepository.count({ where: { parent_contractor: subContractor.parent_contractor, state: 'active', contractor_id: Not(subContractor.contractor_id) } });
    if (totalSubcontractors >= this.MAX_SUBCONTRACTORS && subContractor.state === 'active') {
      throw new Error(`No puede haber mas de ${this.MAX_SUBCONTRACTORS} subcontratistas activos por contratista`);
    }
  }
}
