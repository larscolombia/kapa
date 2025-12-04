import { api } from 'boot/axios';

export default {
  // ========================================
  // REPORTES DE INSPECCIÓN
  // ========================================

  /**
   * Crear un nuevo reporte de inspección
   * @param {Object} data - Datos del reporte
   * @returns {Promise<Object>} Reporte creado
   */
  async createReport(data) {
    try {
      const response = await api.post('/inspecciones', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener lista de reportes con filtros
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<{data: Array, total: number}>} Lista paginada
   */
  async getReports(filters = {}) {
    try {
      const response = await api.get('/inspecciones', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener un reporte por ID
   * @param {number} id - ID del reporte
   * @returns {Promise<Object>} Reporte con sus campos
   */
  async getReportById(id) {
    try {
      const response = await api.get(`/inspecciones/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Actualizar un reporte existente
   * @param {number} id - ID del reporte
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Reporte actualizado
   */
  async updateReport(id, data) {
    try {
      const response = await api.put(`/inspecciones/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Eliminar múltiples reportes (solo admin)
   * @param {Array<number>} ids - IDs de reportes a eliminar
   * @returns {Promise<{deleted: number}>} Cantidad eliminada
   */
  async deleteBulk(ids) {
    try {
      const response = await api.delete('/inspecciones/bulk', { data: { ids } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ========================================
  // MAESTROS
  // ========================================

  /**
   * Obtener tipos de inspección técnica
   * (Seguridad, Medio Ambiente, Salud)
   * @returns {Promise<Array>} Lista de tipos
   */
  async getTiposInspeccion() {
    try {
      const response = await api.get('/inspecciones/maestros/tipos');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener clasificaciones por tipo de inspección
   * @param {number} tipoId - ID del tipo de inspección
   * @returns {Promise<Array>} Lista de clasificaciones filtradas
   */
  async getClasificacionesByTipo(tipoId) {
    try {
      const response = await api.get(`/inspecciones/maestros/clasificaciones/${tipoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener áreas de auditoría
   * @returns {Promise<Array>} Lista de áreas
   */
  async getAreasAuditoria() {
    try {
      const response = await api.get('/inspecciones/maestros/areas');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener clasificaciones de auditoría cruzada
   * @returns {Promise<Array>} Lista de clasificaciones
   */
  async getClasificacionesAuditoria() {
    try {
      const response = await api.get('/inspecciones/maestros/clasificaciones-auditoria');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener estados de reporte
   * @returns {Promise<Array>} Lista de estados
   */
  async getEstados() {
    try {
      const response = await api.get('/inspecciones/maestros/estados');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener áreas de inspección técnica
   * @returns {Promise<Array>} Lista de áreas
   */
  async getAreasInspeccion() {
    try {
      const response = await api.get('/inspecciones/maestros/areas-inspeccion');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener usuarios para "Quien reporta"
   * @returns {Promise<Array>} Lista de usuarios
   */
  async getUsuarios() {
    try {
      const response = await api.get('/inspecciones/maestros/usuarios');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ========================================
  // EXPORTACIÓN
  // ========================================

  /**
   * Exportar reportes a Excel
   * @param {Object} filters - Filtros a aplicar
   * @returns {Promise<Blob>} Archivo Excel
   */
  async exportExcel(filters = {}) {
    try {
      const response = await api.get('/inspecciones/export/excel', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Exportar reportes a PDF
   * @param {Object} filters - Filtros a aplicar
   * @returns {Promise<Blob>} Archivo PDF
   */
  async exportPdf(filters = {}) {
    try {
      const response = await api.get('/inspecciones/export/pdf', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ========================================
  // ADJUNTOS (ATTACHMENTS)
  // ========================================

  /**
   * Subir un archivo adjunto a un reporte
   * @param {number} reportId - ID del reporte
   * @param {File} file - Archivo a subir
   * @returns {Promise<Object>} Datos del adjunto creado
   */
  async uploadAttachment(reportId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/inspecciones/${reportId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener todos los adjuntos de un reporte con URLs de preview
   * @param {number} reportId - ID del reporte
   * @returns {Promise<Array>} Lista de adjuntos con URLs
   */
  async getAttachments(reportId) {
    try {
      const response = await api.get(`/inspecciones/${reportId}/attachments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener URL de descarga de un adjunto
   * @param {number} reportId - ID del reporte
   * @param {number} attachmentId - ID del adjunto
   * @param {string} disposition - 'inline' o 'attachment'
   * @returns {Promise<Object>} Objeto con URL de descarga
   */
  async getAttachmentDownloadUrl(reportId, attachmentId, disposition = 'attachment') {
    try {
      const response = await api.get(`/inspecciones/${reportId}/attachments/${attachmentId}/download`, {
        params: { disposition }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Eliminar un adjunto
   * @param {number} reportId - ID del reporte
   * @param {number} attachmentId - ID del adjunto a eliminar
   * @returns {Promise<void>}
   */
  async deleteAttachment(reportId, attachmentId) {
    try {
      await api.delete(`/inspecciones/${reportId}/attachments/${attachmentId}`);
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
