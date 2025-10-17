import {
  Controller,
  Get,
  BadRequestException,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { EmployeeService } from './employees.service';
import { Employee } from '@entities/employee.entity';

@Controller('employee')
export class EmployeeController {
  constructor(private EmployeeService: EmployeeService) {}
  @Get('/')
  async getEmployees() {
    try {
      const Employees = await this.EmployeeService.getEmployees();
      return Employees;
    } catch (error) {
      throw new BadRequestException('Error al obtener los empleados');
    }
  }

  @Get('project-contractor/:projectContractorId')
  async getEmployeesByProjectContractorId(
    // @Param('subcriterionId') subcriterionId: number,
    @Param('projectContractorId') projectContractorId: number,
  ) {
    try {
      const employees =
        await this.EmployeeService.getEmployeesByProjectContractorId(
          projectContractorId,
        );
      return employees;
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener los empleados por id del subcriterio',
      );
    }
  }

  @Get(':id')
  async getEmployeeById(@Param('id') id: number): Promise<Employee> {
    const employee = await this.EmployeeService.getEmployeeById(id);
    if (!employee) {
      throw new BadRequestException('Empleado no encontrado');
    }
    return employee;
  }

  @Post('/')
  async addEmployee(@Body() employeeData: Partial<Employee>) {
    try {
      const newEmployee = await this.EmployeeService.addEmployee(employeeData);
      return newEmployee;
    } catch (error) {
      throw new BadRequestException(
        'Error al agregar el empleado: ' + error.message,
      );
    }
  }

  @Put('/:id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() employeeData: Partial<Employee>,
  ) {
    try {
      const employeeId = parseInt(id, 10);
      if (isNaN(employeeId)) {
        throw new BadRequestException('El ID del empleado no es válido');
      }
      const updatedEmployee = await this.EmployeeService.updateEmployee(
        employeeId,
        employeeData,
      );
      return updatedEmployee;
    } catch (error) {
      throw new BadRequestException(
        'Error al actualizar el empleado: ' + error.message,
      );
    }
  }

  @Delete(':id')
  async deleteEmployee(@Param('id') id: number): Promise<void> {
    return this.EmployeeService.deleteEmployee(id);
  }
}
