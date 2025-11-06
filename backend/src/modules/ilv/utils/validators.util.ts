import { BadRequestException } from '@nestjs/common';
import { IlvReportType } from '../dto';
import { FieldMapper } from './field-mapper.util';

export class IlvValidators {
  /**
   * Valida que todos los campos requeridos estén presentes
   */
  static validateRequiredFields(tipo: IlvReportType, fields: Record<string, any>): void {
    const required = FieldMapper.getRequiredFields(tipo);
    const fieldKeys = Object.keys(fields);
    
    const missing = required.filter(key => !fieldKeys.includes(key) || !fields[key]);
    
    if (missing.length > 0) {
      throw new BadRequestException(
        `Campos requeridos faltantes para tipo ${tipo}: ${missing.join(', ')}`
      );
    }
  }

  /**
   * Valida que la fecha del evento no sea futura
   */
  static validateDateNotFuture(dateString: string): void {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (date > today) {
      throw new BadRequestException('La fecha del evento no puede ser futura');
    }
  }

  /**
   * Valida que hora_reinicio >= hora_inicio_parada
   */
  static validateTimeSequence(horaInicio: string, horaReinicio: string): void {
    const inicio = new Date(horaInicio);
    const reinicio = new Date(horaReinicio);

    if (reinicio < inicio) {
      throw new BadRequestException(
        'La hora de reinicio debe ser posterior a la hora de inicio de parada'
      );
    }
  }

  /**
   * Valida reglas de negocio según el tipo de reporte
   */
  static validateBusinessRules(tipo: IlvReportType, fields: Record<string, any>): void {
    const validations = FieldMapper.getValidations(tipo);

    for (const [field, rule] of Object.entries(validations)) {
      if (rule === 'date_lte_today' && fields[field]) {
        this.validateDateNotFuture(fields[field]);
      }
      
      if (rule === 'time_gte_hora_inicio_parada' && fields[field]) {
        const horaInicio = fields['hora_inicio_parada'];
        if (horaInicio) {
          this.validateTimeSequence(horaInicio, fields[field]);
        }
      }
    }
  }

  /**
   * Valida campos requeridos para el cierre
   */
  static validateCloseFields(tipo: IlvReportType, fields: Record<string, any>): void {
    const closeRequired = FieldMapper.getCloseRequiredFields(tipo);
    
    if (closeRequired.length === 0) return;

    const missing = closeRequired.filter(key => !fields[key]);
    
    if (missing.length > 0) {
      throw new BadRequestException(
        `Campos requeridos para cierre del tipo ${tipo}: ${missing.join(', ')}`
      );
    }
  }
}
