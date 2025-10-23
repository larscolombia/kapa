import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '@entities/document.entity';
import { Subcriterion } from '@entities/subcriterion.entity';
import { ProjectContractorCriterionsService } from '../project-contractor-criterions/project-contractor-criterions.service';
import { ProjectContractorsService } from '../project-contractors/project-contractors.service';
import { MailUtil } from '@common/utils/mail.util';
import { Employee } from '@entities/employee.entity';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DocumentStateAudit } from '@entities/document-state-audit.entity';
// import { Project } from '@entities/project.entity';
// import { ContractorEmail } from '@entities/contractor-email.entity';

@Injectable()
export class DocumentService {
  private s3Client: S3Client;
  private bucketName = process.env.AWS_S3_BUCKET || 'repositorio-documental-kapa';

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Subcriterion)
    private subcriterionRepository: Repository<Subcriterion>,
    @InjectRepository(DocumentStateAudit)
    private auditRepository: Repository<DocumentStateAudit>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private projectContractorCriterionsService: ProjectContractorCriterionsService,
    private projectContrators: ProjectContractorsService,
    private projectContractorService: ProjectContractorsService,
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async getPresignedUrl(fileKey: string, disposition: 'inline' | 'attachment' = 'attachment'): Promise<string> {
    try {
      const fileName = fileKey.split('/').pop(); // Obtener solo el nombre del archivo
      const contentDisposition = disposition === 'inline'
        ? 'inline'
        : `attachment; filename="${fileName}"`;

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        ResponseContentDisposition: contentDisposition,
      });

      // URL válida por 1 hora
      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      return presignedUrl;
    } catch (error) {
      throw new BadRequestException('Error al generar URL firmada');
    }
  }

  async getDocuments(): Promise<Document[] | undefined> {
    return this.documentRepository.find({
      relations: [
        'projectContractor',
        'projectContractor.contractor',
        'employee',
        'subcriterion',
      ],
    });
  }
  async getDocumentById(
    documentId: number,
  ): Promise<Partial<Document> | undefined> {
    return this.documentRepository.findOneBy({
      document_id: documentId,
    });
  }
  async getDocumentsBySubcriterionId(
    subcriterionId: number,
    projectContractorId: number,
  ): Promise<Document[] | undefined> {
    return this.documentRepository.find({
      where: {
        subcriterion: {
          subcriterion_id: subcriterionId,
        },
        projectContractor: {
          project_contractor_id: projectContractorId,
        },
      },
      select: {
        document_id: true,
        name: true,
        comments: true,
        state: true,
        projectContractor: {
          project_contractor_id: true,
        },
        employee: {
          employee_id: true,
        },
        subcriterion: {
          subcriterion_id: true,
          name: true,
          multiple_required: true,
          employee_required: true,
        },
      },
      relations: ['projectContractor', 'employee', 'subcriterion'],
    });
  }
  async getDocumentsByEmployeeId(
    employeeId: number,
  ): Promise<Document[] | undefined> {
    return this.documentRepository.find({
      where: {
        employee: {
          employee_id: employeeId,
        },
      },
      relations: ['projectContractor', 'employee', 'subcriterion'],
    });
  }
  async getDocumentsByEmployeeIdAndSubcriterionId(
    employeeId: number,
    subcriterionId: number,
  ): Promise<Document[] | undefined> {
    return this.documentRepository.find({
      where: {
        employee: {
          employee_id: employeeId,
        },
        subcriterion: {
          subcriterion_id: subcriterionId,
        },
      },
      relations: ['projectContractor', 'employee', 'subcriterion'],
    });
  }
  async create(documentData: Document, userEmail?: string, userId?: number): Promise<Document> {
    try {
      await this.validateDocumentRequiredFields(documentData);
      const document = this.documentRepository.create(documentData);
      const createdDocument = await this.documentRepository.save(document);

      // Registrar auditoría de creación
      await this.createAuditLog({
        document_id: createdDocument.document_id,
        previous_state: 'none',
        new_state: createdDocument.state,
        comments: 'Documento creado',
        changed_by_email: userEmail,
        changed_by_user_id: userId,
        time_in_previous_state_hours: 0,
      });

      const criterionId = await this.subcriterionRepository
        .findOneBy({ subcriterion_id: document.subcriterion.subcriterion_id })
        .then((subcriterion) => subcriterion.criterion.criterion_id);
      await this.updatePercentageByProjectContractor(
        document.projectContractor.project_contractor_id,
      );
      await this.updatePercentageByCriterion(
        document.projectContractor.project_contractor_id,
        criterionId,
      );
      return createdDocument;
    } catch (error) {
      console.log(error);
    }
  }
  async update(documentData: Document, userEmail?: string, userId?: number): Promise<Document> {
    const { document_id } = documentData;
    const document = await this.documentRepository.findOneBy({ document_id });
    if (!document) throw new NotFoundException('El documento no existe');

    // Guardar estado anterior para auditoría
    const previousState = document.state;
    const stateChangeTime = await this.getLastStateChangeTime(document_id);

    await this.validateDocumentRequiredFields(documentData, true);
    const updatedDocument = this.documentRepository.merge(
      document,
      documentData,
    );
    const createdDocument = await this.documentRepository.save(updatedDocument);

    // Registrar auditoría si cambió el estado
    if (previousState !== createdDocument.state) {
      const timeInPreviousState = stateChangeTime
        ? Math.floor((Date.now() - stateChangeTime.getTime()) / (1000 * 60 * 60))
        : 0;

      await this.createAuditLog({
        document_id: createdDocument.document_id,
        previous_state: previousState,
        new_state: createdDocument.state,
        comments: documentData.comments || '',
        changed_by_email: userEmail,
        changed_by_user_id: userId,
        time_in_previous_state_hours: timeInPreviousState,
      });
    }

    await this.updatePercentageByCriterion(
      document.projectContractor.project_contractor_id,
      document.subcriterion.criterion.criterion_id,
    );
    return createdDocument;
  }
  async delete(documentId: number): Promise<void> {
    const document = await this.documentRepository.findOneBy({
      document_id: documentId,
    });
    if (!document) {
      throw new NotFoundException('El documento no existe');
    }
    await this.documentRepository.delete(documentId);
  }
  async validateDocumentRequiredFields(
    documentData: Document,
    isUpdate = false,
  ) {
    if (!documentData.document_id && isUpdate)
      throw new BadRequestException(
        'El identificador del documento es requerido',
      );
    if (!documentData.name)
      throw new BadRequestException('El nombre del documento es requerido');
    if (!documentData.state)
      throw new BadRequestException('El estado del documento es requerido');
  }

  async updatePercentageByCriterion(
    projectContractorId: number,
    criterionId: number,
  ): Promise<void> {
    const approvalPercentage =
      await this.calculateApprovalPercentageByCriterion(
        projectContractorId,
        criterionId,
      );
    await this.projectContractorCriterionsService.createOrUpdate(
      projectContractorId,
      criterionId,
      approvalPercentage,
    );
  }

  async updatePercentageByProjectContractor(
    projectContractorId: number,
  ): Promise<void> {
    const completionPercentage =
      await this.calculateCompletionPercentage(projectContractorId);
    await this.projectContrators.updateProyectContractorPercentage(
      projectContractorId,
      completionPercentage,
    );
  }
  async getDocumentsByProjectContractorIdAndState(
    projectContractorId: number,
    state: string,
  ): Promise<Document[] | undefined> {
    return this.documentRepository.find({
      where: {
        projectContractor: {
          project_contractor_id: projectContractorId,
        },
        state: state,
      },
      select: {
        document_id: true,
        name: true,
        comments: true,
        state: true,
        projectContractor: {
          project_contractor_id: true,
        },
        employee: {
          employee_id: true,
        },
        subcriterion: {
          subcriterion_id: true,
          name: true,
        },
      },
      relations: ['projectContractor', 'employee', 'subcriterion'],
    });
  }

  async getDocumentsByProjectId(
    projectId: number,
  ): Promise<Document[] | undefined> {
    return this.documentRepository.find({
      where: {
        projectContractor: {
          project: {
            project_id: projectId,
          },
        },
      },
      relations: ['projectContractor', 'employee', 'subcriterion'],
    });
  }

  async getDocumentsByContractorId(
    contractorId: number,
  ): Promise<Document[] | undefined> {
    return this.documentRepository.find({
      where: {
        projectContractor: {
          contractor: {
            contractor_id: contractorId,
          },
        },
      },
      relations: ['projectContractor', 'employee', 'subcriterion'],
    });
  }

  async calculateApprovalPercentageByCriterion(
    projectContractorId: number,
    criterionId: number,
  ): Promise<number> {
    try {
      // 1. Obtener todos los subcriterios asociados al criterio dado omitiendo empleados.
      const subcriterions = await this.subcriterionRepository
        .createQueryBuilder('subcriterion')
        .where('subcriterion.criterion = :criterionId', { criterionId })
        .getMany();
      // 2. Obtener todos los documentos cargados para esos subcriterios específicos.
      const documents = await this.documentRepository
        .createQueryBuilder('document')
        .innerJoinAndSelect('document.subcriterion', 'subcriterion')
        .select([
          'document.subcriterion_id',
          'document.state AS state',
          'document.employee_id',
        ])
        .where('subcriterion.criterion = :criterionId', { criterionId })
        .andWhere('document.projectContractor = :projectContractorId', {
          projectContractorId,
        })
        .distinct(true)
        .getRawMany();
      // 3. Obtener todos los empleados asociados al projectContractorId.
      const employees = await this.employeeRepository
        .createQueryBuilder('employee')
        .where('employee.projectContractor = :projectContractorId', {
          projectContractorId,
        })
        .getMany();
      // 4. Calcular el total de subcriterios aplicables, teniendo en cuenta si se requiere un documento por empleado.
      let totalSubcriterions = subcriterions.reduce((total, subcriterion) => {
        const employeeCount = subcriterion.employee_required
          ? employees.length
          : 1;
        return total + employeeCount;
      }, 0);
      // 5. contar Los documentos con estado "not_applicable".
      const notApplicableDocuments = documents.filter(
        (doc) => doc.state === 'not_applicable',
      ).length;
      totalSubcriterions -= notApplicableDocuments;
      // 6. Contar los documentos aprobados.
      const approvedDocuments = documents.filter(
        (doc) => doc.state === 'approved',
      ).length;
      // 7. Calcular el porcentaje de aprobación.
      const approvalPercentage = totalSubcriterions > 0 ? (approvedDocuments / totalSubcriterions) * 100 : 100;
      return parseInt(approvalPercentage.toFixed(0));
    } catch (error) {
      console.log(error);
    }
  }

  async calculateCompletionPercentage(
    projectContractorId: number,
  ): Promise<number> {
    try {
      const details = await this.calculateCompletionPercentageWithDetails(projectContractorId);
      return details.percentage;
    } catch (error) {
      console.log(error);
    }
  }

  async calculateCompletionPercentageWithDetails(
    projectContractorId: number,
  ): Promise<{
    percentage: number;
    loadedDocuments: number;
    totalSubcriterions: number;
    notApplicable: number;
    approved: number;
    submitted: number;
    rejected: number;
  }> {
    try {
      // Obtener todos los subcriterios para los criterios de tipo "Ingreso (1)"
      const subcriterions = await this.subcriterionRepository.find({
        where: {
          criterion: {
            documentType: {
              type_id: 1
            }
          },
        },
      });

      // Calcular el total de subcriterios, teniendo en cuenta si se requiere un documento por empleado.
      const employees = await this.employeeRepository
        .createQueryBuilder('employee')
        .where('employee.projectContractor = :projectContractorId', { projectContractorId })
        .getMany();

      let totalSubcriterions = subcriterions.reduce((total, subcriterion) => {
        const employeeCount = subcriterion.employee_required ? employees.length : 1;
        return total + employeeCount;
      }, 0);

      // Contar cuántos documentos están cargados para el `projectContractor` y `criterion`
      const loadedDocuments = await this.documentRepository
        .createQueryBuilder('document')
        .innerJoin('document.subcriterion', 'subcriterion')
        .select([
          'document.subcriterion_id',
          'document.state AS state',
          'document.employee_id'
        ])
        .where('document.projectContractor = :projectContractorId', {
          projectContractorId: projectContractorId,
        })
        .andWhere('document.state IN (:...states)', { states: ['submitted', 'approved', 'rejected', 'not_applicable'] })
        .distinct(true)
        .getRawMany();

      // Contar documentos por estado
      const notApplicableDocuments = loadedDocuments.filter(
        (doc) => doc.state === 'not_applicable',
      ).length;

      const approvedDocuments = loadedDocuments.filter(
        (doc) => doc.state === 'approved',
      ).length;

      const submittedDocuments = loadedDocuments.filter(
        (doc) => doc.state === 'submitted',
      ).length;

      const rejectedDocuments = loadedDocuments.filter(
        (doc) => doc.state === 'rejected',
      ).length;

      const totalSubcriterionsOriginal = totalSubcriterions;
      totalSubcriterions -= notApplicableDocuments;

      // Contar los demas documentos.
      const loadedDocumentsCount = loadedDocuments.length - notApplicableDocuments;

      // Calcular el porcentaje de completitud
      const completionPercentage = totalSubcriterions > 0 ? (loadedDocumentsCount / totalSubcriterions) * 100 : 0;

      return {
        percentage: parseInt(completionPercentage.toFixed(0)),
        loadedDocuments: loadedDocumentsCount,
        totalSubcriterions: totalSubcriterions,
        notApplicable: notApplicableDocuments,
        approved: approvedDocuments,
        submitted: submittedDocuments,
        rejected: rejectedDocuments,
      };
    } catch (error) {
      console.log(error);
      return {
        percentage: 0,
        loadedDocuments: 0,
        totalSubcriterions: 0,
        notApplicable: 0,
        approved: 0,
        submitted: 0,
        rejected: 0,
      };
    }
  }
  async sendNotification(
    projectId: number,
    contractorId: number,
    email: string,
  ): Promise<boolean> {
    console.log('Enviando resultados');

    const projectContractor =
      await this.projectContractorService.getProjectContractorByContractorIdAndProjectId(
        contractorId,
        projectId,
      );

    if (!projectContractor) {
      throw new NotFoundException(
        'No existe ningun contratista registrado para este proyecto',
      );
    }

    const documents = await this.getDocumentsByProjectContractorIdAndState(
      projectContractor.project_contractor_id,
      'submitted',
    );

    if (!documents || documents.length === 0) {
      console.log(
        'No se ha cargado ningun documento para este proyecto. Cancelando el envío.',
      );
      return false;
    }

    const htmlContent = this.generateHtmlReport(
      projectContractor.project,
      projectContractor.contractor,
      documents,
      projectContractor.completition_percentage,
    );

    await MailUtil.sendMail({
      to: email,
      subject: 'Nuevo cargue documental: ' + projectContractor.project.name,
      html: htmlContent,
    });

    console.log('Correo enviado con éxito');
    return true;
  }

  generateHtmlReport(project, contractor, documents, completition_percentage) {
    let criterionRows = '';

    // Agrupar documentos por criterio
    const criteriaMap = new Map<string, string[]>();
    documents.forEach((document) => {
      const criterionName = document.subcriterion.criterion.name;
      const subcriterionName = document.subcriterion.name;

      if (!criteriaMap.has(criterionName)) {
        criteriaMap.set(criterionName, []);
      }

      criteriaMap.get(criterionName)?.push(subcriterionName);
    });

    // Crear HTML para cada criterio y sus subcriterios en una sola tabla
    criteriaMap.forEach((subcriteria, criterion) => {
      subcriteria.forEach((subcriterion) => {
        criterionRows += `
                <tr>
                    <td>${criterion}</td>
                    <td>${subcriterion}</td>
                </tr>
            `;
      });
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
                .project-info, .contractor-info, .project-status, .criteria {
                    margin-bottom: 20px;
                }
                p {
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
                <h1>Notificación cargue de documentos</h1>
                
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

                <div class="criteria">
                    <h2>Lista de documentos del Proyecto Cargados</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Criterio</th>
                                <th>Subcriterio</th>
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

  async getDocumentsCloseToEndDate(): Promise<Document[] | undefined> {
    //obtiene la fecha actual
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    const documents = await this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.projectContractor', 'projectContractor')
      .leftJoinAndSelect('projectContractor.project', 'project')
      .leftJoinAndSelect('projectContractor.contractor', 'contractor')
      .leftJoinAndSelect('contractor.emails', 'emails')
      .leftJoinAndSelect('document.employee', 'employee')
      .leftJoinAndSelect('document.subcriterion', 'subcriterion')
      .where('document.endDate BETWEEN :now AND :oneWeekFromNow', {
        now: new Date(),
        oneWeekFromNow,
      })
      .getMany();

    return documents;
  }

  // ==================== MÉTODOS DE AUDITORÍA ====================

  private async createAuditLog(auditData: {
    document_id: number;
    previous_state: string;
    new_state: string;
    comments?: string;
    changed_by_email?: string;
    changed_by_user_id?: number;
    time_in_previous_state_hours?: number;
  }): Promise<void> {
    try {
      const audit = this.auditRepository.create({
        document_id: auditData.document_id,
        previous_state: auditData.previous_state,
        new_state: auditData.new_state,
        comments: auditData.comments || '',
        changed_by_email: auditData.changed_by_email,
        changed_by_user_id: auditData.changed_by_user_id,
        time_in_previous_state_hours: auditData.time_in_previous_state_hours || 0,
      });

      await this.auditRepository.save(audit);
      console.log(`[AUDIT] Documento ${auditData.document_id}: ${auditData.previous_state} → ${auditData.new_state} (${auditData.time_in_previous_state_hours}h)`);
    } catch (error) {
      console.error('Error al crear registro de auditoría:', error);
    }
  }

  private async getLastStateChangeTime(documentId: number): Promise<Date | null> {
    try {
      const lastAudit = await this.auditRepository.findOne({
        where: { document_id: documentId },
        order: { changed_at: 'DESC' },
      });

      return lastAudit ? lastAudit.changed_at : null;
    } catch (error) {
      console.error('Error al obtener último cambio de estado:', error);
      return null;
    }
  }

  async getDocumentAuditHistory(documentId: number): Promise<DocumentStateAudit[]> {
    return await this.auditRepository.find({
      where: { document_id: documentId },
      relations: ['changed_by_user'],
      order: { changed_at: 'DESC' },
    });
  }
}
