import { api } from 'boot/axios';

export default {
  // Reportes
  async createReport(data) {
    try {
      const response = await api.post('/api/ilv/reports', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getReports(filters = {}) {
    try {
      const response = await api.get('/api/ilv/reports', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getReportById(id) {
    try {
      const response = await api.get(`/api/ilv/reports/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async updateReport(id, data) {
    try {
      const response = await api.put(`/api/ilv/reports/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cierre vía token (sin autenticación)
  async closeReport(token, data) {
    try {
      const response = await api.post(`/ilv/close?token=${token}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Maestros
  async getMaestros(tipo) {
    try {
      const response = await api.get(`/api/ilv/maestros/${tipo}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async createMaestro(data) {
    try {
      const response = await api.post('/api/ilv/maestros', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async updateMaestro(id, data) {
    try {
      const response = await api.put(`/api/ilv/maestros/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async deleteMaestro(id) {
    try {
      const response = await api.delete(`/api/ilv/maestros/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Configuración de campos por tipo
  getFieldConfig(tipo) {
    const configs = {
      hazard_id: {
        required: ['ubicacion', 'descripcion_condicion', 'severidad', 'area', 'fecha_evento'],
        optional: ['foto', 'causa_probable', 'accion_inmediata'],
        maestros: {
          severidad: 'severidad',
          area: 'area',
          causa_probable: 'causa'
        },
        validations: {
          fecha_evento: (value) => new Date(value) <= new Date()
        }
      },
      wit: {
        required: ['conducta_observada', 'riesgo_asociado', 'recomendacion', 'responsable'],
        optional: ['testigo', 'adjuntos'],
        maestros: {
          riesgo_asociado: 'riesgo'
        }
      },
      swa: {
        required: ['hora_inicio_parada', 'hora_reinicio', 'motivo', 'area', 'responsable'],
        optional: [],
        maestros: {
          motivo: 'motivo_swa',
          area: 'area'
        },
        validations: {
          hora_reinicio: (value, allFields) => {
            const inicio = allFields.find(f => f.key === 'hora_inicio_parada')?.value;
            return !inicio || new Date(`2000-01-01 ${value}`) >= new Date(`2000-01-01 ${inicio}`);
          }
        }
      },
      fdkar: {
        required: ['quien_reporta', 'clasificacion', 'descripcion', 'plan_accion_propuesto'],
        optional: [],
        maestros: {
          clasificacion: 'clasificacion_fdkar'
        },
        close_required: ['evidencia_cierre', 'fecha_implantacion']
      }
    };
    return configs[tipo] || {};
  },

  // Validaciones
  validateFields(tipo, fields) {
    const config = this.getFieldConfig(tipo);
    const errors = [];

    // Verificar campos requeridos
    config.required?.forEach(field => {
      if (!fields.find(f => f.key === field && f.value)) {
        errors.push(`El campo '${field}' es requerido`);
      }
    });

    // Aplicar validaciones específicas
    if (config.validations) {
      Object.entries(config.validations).forEach(([field, validator]) => {
        const fieldData = fields.find(f => f.key === field);
        if (fieldData && !validator(fieldData.value, fields)) {
          errors.push(`El campo '${field}' no es válido`);
        }
      });
    }

    return errors;
  },

  // Tipos de reporte
  getReportTypes() {
    return [
      { value: 'hazard_id', label: 'Identificación de Peligros', icon: 'warning' },
      { value: 'wit', label: 'Walk & Talk', icon: 'directions_walk' },
      { value: 'swa', label: 'Stop Work Authority', icon: 'stop' },
      { value: 'fdkar', label: 'FDKAR', icon: 'find_in_page' }
    ];
  },

  // Estados
  getEstados() {
    return [
      { value: 'abierto', label: 'Abierto', color: 'orange' },
      { value: 'cerrado', label: 'Cerrado', color: 'green' }
    ];
  }
};