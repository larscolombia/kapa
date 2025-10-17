import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '@entities/employee.entity';
import { Subcriterion } from '@entities/subcriterion.entity';
import { ProjectContractor } from '@entities/project-contractor.entity';
import { EmployeeDto } from './dto/employee.dto';
import { DocumentService } from '../documents/documents.service';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Subcriterion)
    private readonly subcriterionRepository: Repository<Subcriterion>,

    @InjectRepository(ProjectContractor)
    private readonly projectContractorRepository: Repository<ProjectContractor>,
    private documentService: DocumentService,
  ) { }
  async getEmployees(): Promise<Employee[] | undefined> {
    return this.employeeRepository.find({
      relations: ['projectContractor'],
    });
  }

  async getEmployeeById(employee_id: number): Promise<Employee> {
    return this.employeeRepository.findOne({ where: { employee_id } });
  }

  async getEmployeesByProjectContractorId(
    projectContractorId: number,
  ): Promise<EmployeeDto[]> {
    const employees = await this.employeeRepository.find({
      where: {
        projectContractor: {
          project_contractor_id: projectContractorId,
        },
      },
      select: ['employee_id', 'name', 'identification', 'position'],
      relations: ['projectContractor'],
      order: { employee_id: 'ASC' },
    });

    return employees.map((employee) => ({
      employee_id: employee.employee_id,
      name: employee.name,
      identification: employee.identification,
      position: employee.position,
      project_contractor_id: employee.projectContractor?.project_contractor_id,
    }));
  }

  async addEmployee(employeeData: Partial<Employee>): Promise<{
    employee_id: number;
    identification: string;
    name: string;
    position: string;
    project_contractor_id: number;
  }> {
    const projectContractorId = Number(employeeData.projectContractor);

    const projectContractor = await this.projectContractorRepository.findOne({
      where: { project_contractor_id: projectContractorId },
    });

    if (!projectContractor) {
      throw new NotFoundException('Contratista del proyecto no encontrado');
    }

    const newEmployee = this.employeeRepository.create({
      ...employeeData,
      projectContractor,
    });
    await this.employeeRepository.save(newEmployee);
    await this.updatePercentages(projectContractorId);

    return {
      employee_id: newEmployee.employee_id,
      identification: newEmployee.identification,
      name: newEmployee.name,
      position: newEmployee.position,
      project_contractor_id: projectContractor.project_contractor_id,
    };
  }

  async updateEmployee(
    id: number,
    employeeData: Partial<Employee>,
  ): Promise<{
    employee_id: number;
    identification: string;
    name: string;
    position: string;
    project_contractor_id: number;
  }> {
    const existingEmployee = await this.employeeRepository.findOne({
      where: { employee_id: id },
    });

    if (!existingEmployee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const projectContractorId = Number(employeeData.projectContractor);

    const projectContractor = projectContractorId
      ? await this.projectContractorRepository.findOne({
        where: { project_contractor_id: projectContractorId },
      })
      : existingEmployee.projectContractor;

    if (!projectContractor && projectContractorId) {
      throw new NotFoundException('Contratista del proyecto no encontrado');
    }

    const updatedEmployee = this.employeeRepository.merge(existingEmployee, {
      ...employeeData,
      projectContractor,
    });

    await this.employeeRepository.save(updatedEmployee);

    return {
      employee_id: updatedEmployee.employee_id,
      identification: updatedEmployee.identification,
      name: updatedEmployee.name,
      position: updatedEmployee.position,
      project_contractor_id: projectContractor?.project_contractor_id,
    };
  }

  async deleteEmployee(id: number): Promise<void> {
    const existingEmployee = await this.employeeRepository.findOne({
      where: { employee_id: id },
      relations: ['projectContractor'],
    });
    if (!existingEmployee) {
      throw new NotFoundException('Empleado no encontrado');
    }
    const projectContractorId = existingEmployee.projectContractor?.project_contractor_id;
    await this.employeeRepository.delete(id);
    await this.updatePercentages(projectContractorId);
  }


  async updatePercentages(project_contractor_id: number) {
    const subcriterionsWithEmployees = await this.subcriterionRepository.find({
      where: {
        employee_required: true
      },
      relations: ['criterion']
    });
    const criterions = new Set(subcriterionsWithEmployees.map(subcriterion => subcriterion.criterion.criterion_id));
    for (const criterion_id of criterions) {
      await this.documentService.updatePercentageByCriterion(project_contractor_id, criterion_id);
    }
    await this.documentService.updatePercentageByProjectContractor(project_contractor_id);
  }
}
