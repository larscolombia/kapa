import { api } from 'boot/axios';

export default {
  // ========================================
  // PLANTILLAS DE FORMULARIOS
  // ========================================

  /**
   * Crear una nueva plantilla de formulario
   * @param {Object} data - Datos de la plantilla
   * @returns {Promise<Object>} Plantilla creada
   */
  async createTemplate(data) {
    try {
      const response = await api.post('/form-builder/templates', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener lista de plantillas con filtros
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<{data: Array, total: number}>} Lista paginada
   */
  async getTemplates(filters = {}) {
    try {
      const response = await api.get('/form-builder/templates', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener una plantilla por ID
   * @param {number} id - ID de la plantilla
   * @returns {Promise<Object>} Plantilla completa
   */
  async getTemplateById(id) {
    try {
      const response = await api.get(`/form-builder/templates/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Actualizar una plantilla
   * @param {number} id - ID de la plantilla
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Plantilla actualizada
   */
  async updateTemplate(id, data) {
    try {
      const response = await api.put(`/form-builder/templates/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Eliminar una plantilla
   * @param {number} id - ID de la plantilla
   * @returns {Promise<void>}
   */
  async deleteTemplate(id) {
    try {
      await api.delete(`/form-builder/templates/${id}`);
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Duplicar una plantilla
   * @param {number} id - ID de la plantilla original
   * @param {Object} data - Datos opcionales (nuevo nombre)
   * @returns {Promise<Object>} Nueva plantilla
   */
  async duplicateTemplate(id, data = {}) {
    try {
      const response = await api.post(`/form-builder/templates/${id}/duplicate`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener clasificaciones disponibles
   * @returns {Promise<Array>} Lista de clasificaciones
   */
  async getAvailableClassifications() {
    try {
      const response = await api.get('/form-builder/templates/classifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Asignar clasificaciones a una plantilla
   * @param {number} id - ID de la plantilla
   * @param {Array} classifications - Array de clasificaciones
   * @returns {Promise<Object>} Plantilla actualizada
   */
  async assignClassifications(id, classifications) {
    try {
      const response = await api.put(`/form-builder/templates/${id}/classifications`, {
        classifications,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener formularios por clasificación
   * @param {number} maestroId - ID de la clasificación
   * @returns {Promise<Array>} Lista de formularios
   */
  async getTemplatesByClassification(maestroId) {
    try {
      const response = await api.get(`/form-builder/templates/by-classification/${maestroId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Validar esquema de formulario
   * @param {Object} schema - Esquema a validar
   * @returns {Promise<{valid: boolean, errors: Array}>}
   */
  async validateSchema(schema) {
    try {
      const response = await api.post('/form-builder/templates/validate-schema', { schema });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ========================================
  // RESPUESTAS DE FORMULARIOS
  // ========================================

  /**
   * Enviar respuesta de formulario
   * @param {Object} data - Datos del formulario
   * @returns {Promise<Object>} Respuesta guardada
   */
  async submitForm(data) {
    try {
      const response = await api.post('/form-builder/submissions', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener respuestas con filtros
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<{data: Array, total: number}>} Lista paginada
   */
  async getSubmissions(filters = {}) {
    try {
      const response = await api.get('/form-builder/submissions', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener respuestas por inspección
   * @param {number} reportId - ID de la inspección
   * @returns {Promise<Array>} Lista de respuestas
   */
  async getSubmissionsByReport(reportId) {
    try {
      const response = await api.get(`/form-builder/submissions/by-report/${reportId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener una respuesta por ID
   * @param {number} id - ID de la respuesta
   * @returns {Promise<Object>} Respuesta completa
   */
  async getSubmissionById(id) {
    try {
      const response = await api.get(`/form-builder/submissions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Actualizar una respuesta
   * @param {number} id - ID de la respuesta
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Respuesta actualizada
   */
  async updateSubmission(id, data) {
    try {
      const response = await api.put(`/form-builder/submissions/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener historial de cambios de una respuesta
   * @param {number} id - ID de la respuesta
   * @returns {Promise<Array>} Historial de cambios
   */
  async getSubmissionHistory(id) {
    try {
      const response = await api.get(`/form-builder/submissions/${id}/history`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Eliminar una respuesta
   * @param {number} id - ID de la respuesta
   * @returns {Promise<void>}
   */
  async deleteSubmission(id) {
    try {
      await api.delete(`/form-builder/submissions/${id}`);
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ========================================
  // BORRADORES (AUTOGUARDADO)
  // ========================================

  /**
   * Guardar borrador
   * @param {Object} data - Datos del borrador
   * @returns {Promise<Object>} Borrador guardado
   */
  async saveDraft(data) {
    try {
      const response = await api.post('/form-builder/submissions/draft', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener borrador del usuario
   * @param {number} templateId - ID de la plantilla
   * @param {number} reportId - ID de la inspección (opcional)
   * @returns {Promise<Object|null>} Borrador o null
   */
  async getDraft(templateId, reportId = null) {
    try {
      const params = reportId ? { reportId } : {};
      const response = await api.get(`/form-builder/submissions/draft/${templateId}`, { params });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener lista de borradores del usuario
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de borradores
   */
  async getDrafts(filters = {}) {
    try {
      const response = await api.get('/form-builder/submissions/drafts/list', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Eliminar borrador
   * @param {number} id - ID del borrador
   * @returns {Promise<void>}
   */
  async deleteDraft(id) {
    try {
      await api.delete(`/form-builder/submissions/draft/${id}`);
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
