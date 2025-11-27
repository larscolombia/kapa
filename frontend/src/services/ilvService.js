import { api } from 'boot/axios';

export default {
  // Reportes
  async createReport(data) {
    try {
      const response = await api.post('/ilv/reports', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getReports(filters = {}) {
    try {
      const response = await api.get('/ilv/reports', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getReportById(id) {
    try {
      const response = await api.get(`/ilv/reports/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async updateReport(id, data) {
    try {
      const response = await api.put(`/ilv/reports/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async deleteBulk(ids) {
    try {
      const response = await api.delete('/ilv/reports/bulk', { data: { ids } });
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

  // Obtener reporte público con token (para vista cierre)
  async getReportPublic(id, token) {
    try {
      const response = await api.get(`/ilv/reports/public/${id}?token=${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Maestros
  async getMaestros(tipo) {
    try {
      const response = await api.get(`/ilv/maestros/${tipo}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async createMaestro(data) {
    try {
      const response = await api.post('/ilv/maestros', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async updateMaestro(id, data) {
    try {
      const response = await api.put(`/ilv/maestros/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async deleteMaestro(id) {
    try {
      const response = await api.delete(`/ilv/maestros/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Maestros jerárquicos (Sprint 2 - T2.2)
  async getMaestrosTree(tipo) {
    try {
      const response = await api.get(`/ilv/maestros/${tipo}/tree`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getSubcategorias(categoriaId) {
    try {
      const response = await api.get(`/ilv/maestros/subcategorias/${categoriaId}`);
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
        required: ['nombre_quien_reporta', 'conducta_observada', 'recomendacion', 'tipo'],
        optional: ['testigo', 'adjuntos', 'observacion'],
        maestros: {
          tipo: 'tipo_wit_hallazgo'
        }
      },
      swa: {
        required: ['nombre_quien_reporta', 'nombre_ehs_contratista', 'nombre_supervisor_obra', 'descripcion_hallazgo', 'hora_inicio_parada', 'hora_reinicio', 'tipo', 'tipo_swa'],
        optional: ['observacion', 'descripcion_cierre'],
        maestros: {
          tipo: 'tipo_swa_hallazgo',
          tipo_swa: 'tipo_swa'
        },
        validations: {
          hora_reinicio: (value, allFields) => {
            const inicio = allFields.find(f => f.key === 'hora_inicio_parada')?.value;
            return !inicio || new Date(`2000-01-01 ${value}`) >= new Date(`2000-01-01 ${inicio}`);
          }
        }
      },
      fdkar: {
        required: ['nombre_quien_reporta', 'tipo_tarjeta', 'descripcion_hallazgo'],
        optional: ['observacion', 'descripcion_cierre'],
        maestros: {
          tipo_tarjeta: 'tipo_tarjeta'
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
      { value: 'hazard_id', label: 'Identificación de Peligros (HID)', icon: 'warning' },
      { value: 'wit', label: 'Walk & Talk (W&T)', icon: 'directions_walk' },
      { value: 'swa', label: 'Stop Work Authority (SWA)', icon: 'stop' },
      { value: 'fdkar', label: 'Safety Cards', icon: 'credit_card' }
    ];
  },

  // Estados
  getEstados() {
    return [
      { value: 'abierto', label: 'Abierto', color: 'orange' },
      { value: 'cerrado', label: 'Cerrado', color: 'green' }
    ];
  },

  // Estadísticas
  async getStats() {
    const response = await api.get('/ilv/stats/summary');
    return response.data;
  },

  async getTrend(days = 30) {
    const response = await api.get(`/ilv/stats/trend?days=${days}`);
    return response.data;
  },

  async getProjectStats() {
    const response = await api.get('/ilv/stats/by-project');
    return response.data;
  },

  // Exportación
  async exportExcel(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/ilv/reports/export/excel?${params}`, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reportes_ilv_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  async exportPdf(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/ilv/reports/export/pdf?${params}`, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reportes_ilv_${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  // Adjuntos / Attachments
  async uploadAttachment(reportId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/ilv/reports/${reportId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getAttachments(reportId) {
    try {
      const response = await api.get(`/ilv/reports/${reportId}/attachments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getAttachmentById(reportId, attachmentId) {
    try {
      const response = await api.get(`/ilv/reports/${reportId}/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getAttachmentDownloadUrl(reportId, attachmentId) {
    try {
      const response = await api.get(`/ilv/reports/${reportId}/attachments/${attachmentId}/download`);
      return response.data.url; // Retorna URL firmada S3
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async deleteAttachment(reportId, attachmentId) {
    try {
      const response = await api.delete(`/ilv/reports/${reportId}/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};