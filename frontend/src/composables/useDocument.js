import { ref } from 'vue';
import { getDocumentsBySubcriterionId, createDocuments, updateDocuments, deleteDocuments } from 'src/services/documentService';
import S3Manager from 'src/utils/s3Manager.js';


export const useDocument = () => {
  const awsS3 = new S3Manager();
  const error = ref(null);

  async function processDocument(file, projectContractorId, employeeId, subcriterionId, url, startDate, endDate) {
    try {
      const newName = formatFileName(file.name);
      const urlName = url + newName;

      await awsS3.writeFile(file, urlName);

      const document = {
        name: newName,
        comments: '',
        state: 'submitted',
        projectContractor: { project_contractor_id: projectContractorId },
        employee: { employee_id: employeeId || null },
        subcriterion: { subcriterion_id: subcriterionId },
        startDate: startDate,
        endDate: endDate
      };

      await createDocuments(document);
    } catch (error) {
      error.value = error.message;
    }
  }
  async function uploadStateDocument(subcriterionId, projectContractorId, comment, state, employeeId) {
    try {
      let documents = await getDocumentsBySubcriterionId(subcriterionId, projectContractorId);
      if (employeeId) {
        documents = [...documents].filter(document => document.employee.employee_id == employeeId);
      }
      if (documents.length <= 0) {
        const document = {
          name: 'no_aplica',
          comments: comment,
          state: state,
          projectContractor: { project_contractor_id: projectContractorId },
          employee: { employee_id: employeeId },
          subcriterion: { subcriterion_id: subcriterionId }
        };
        await createDocuments(document);
      } else {
        const resultPromises = documents.map(async (document) => {
          const doc = {
            document_id: document.document_id,
            name: document.name,
            employee: document.employee,
            comments: comment,
            state: state
          }
          await updateDocuments(doc);
        });
        await Promise.all(resultPromises);
      }
    } catch (error) {
      error.value = error.message;
    }
  }

  async function getDocumentUrl(subcriterionId, projectContractorId, employeeId, urlDoc, forPreview = false) {
    try {
      let documents = await getDocumentsBySubcriterionId(subcriterionId, projectContractorId);

      if (employeeId) {
        documents = documents.filter(document => document.employee.employee_id == employeeId);
      }

      if (documents.length > 0) {
        const document = documents[0]; // Tomar el primer documento
        const fileKey = urlDoc + document.name;

        // Encode el fileKey para manejar caracteres especiales y barras
        const encodedFileKey = encodeURIComponent(fileKey);

        // Para vista previa usar disposition=inline, para descarga usar disposition=attachment
        const disposition = forPreview ? 'inline' : 'attachment';

        // Obtener URL firmada del backend
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/document/presigned-url/${encodedFileKey}?disposition=${disposition}`);
        const data = await response.json();

        return { url: data.url, name: document.name };
      }

      return null;
    } catch (error) {
      console.error('Error al obtener URL del documento:', error);
      return null;
    }
  }

  async function checkDocumentExists(subcriterionId, projectContractorId, employeeId, urlDoc) {
    try {
      let documents = await getDocumentsBySubcriterionId(subcriterionId, projectContractorId);

      if (employeeId) {
        documents = documents.filter(document => document.employee.employee_id == employeeId);
      }

      if (documents.length > 0) {
        const document = documents[0];
        const fileExists = await awsS3.checkFileExists(urlDoc + document.name);
        return {
          hasDocument: true,
          fileExists,
          fileName: document.name,
          documentInfo: document
        };
      }

      return {
        hasDocument: false,
        fileExists: false,
        fileName: null,
        documentInfo: null
      };
    } catch (error) {
      console.error('Error al verificar documento:', error);
      return {
        hasDocument: false,
        fileExists: false,
        fileName: null,
        documentInfo: null
      };
    }
  }

  async function downloadDocument(subcriterionId, projectContractorId, employeeId, urlDoc) {
    try {
      let documents = await getDocumentsBySubcriterionId(subcriterionId, projectContractorId);

      if (employeeId) {
        documents = documents.filter(document => document.employee.employee_id == employeeId);
      }

      const downloadUrls = await getDownloadUrls(documents, urlDoc);

      await downloadFiles(downloadUrls);

    } catch (error) {
      console.error('Error al procesar documentos:', error);
    }
  }

  async function getDownloadUrls(documents, urlDoc) {
    const downloadPromises = documents.map(async (document) => {
      try {
        const fileKey = urlDoc + document.name;
        // Encode el fileKey para manejar caracteres especiales y barras
        const encodedFileKey = encodeURIComponent(fileKey);

        // Para descarga usar disposition=attachment
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/document/presigned-url/${encodedFileKey}?disposition=attachment`);
        const data = await response.json();
        return { url: data.url, name: document.name };
      } catch (error) {
        console.error(`Error al obtener la URL de ${document.name}:`, error);
        return null;
      }
    });

    const downloadUrls = await Promise.all(downloadPromises);

    return downloadUrls.filter(item => item !== null);
  }

  async function downloadFiles(validUrls) {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    for (const { url, name } of validUrls) {
      await downloadFile(url, name);
      await delay(1000);
    }
  }

  function downloadFile(url, name) {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }


  async function deleteCurrentDocuments(subcriterionId, projectContractorId, employeeId, url) {
    try {
      let documents = await getDocumentsBySubcriterionId(subcriterionId, projectContractorId);

      if (employeeId) {
        documents = [...documents].filter(document => document.employee.employee_id == employeeId);
      }
      if (documents.length > 0) {
        const deletePromises = documents.map(async (document) => {
          try {
            await deleteDocuments(document.document_id);
            await awsS3.deleteFile(url + document.name);
          } catch (error) {
            console.error(`Error al eliminar el documento ${document.name}:`, error);
          }
        });
        await Promise.all(deletePromises);
      }
    } catch (error) {
      error.value = error.message;
    }
  }

  async function deleteDocumentsSend(documents, url) {
    try {
      if (documents.length > 0) {
        const deletePromises = documents.map(async (document) => {
          try {
            await deleteDocuments(document.document_id);
            await awsS3.deleteFolder(url);
          } catch (error) {
            console.error(`Error al eliminar el documento ${document.name}:`, error);
          }
        });
        await Promise.all(deletePromises);
      }
    } catch (error) {
      error.value = error.message;
    }
  }

  const formatFileName = (originalName) => {
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const sanitizedBaseName = baseName.replace(/ /g, '_');
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
    const newFileName = `${sanitizedBaseName}_${formattedDate}`.slice(0, 240);

    return `${newFileName}.${extension}`;
  }

  async function uploadSupportFile(file, displayName, category, createdBy) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('displayName', displayName);
      // Ensure category is sent as a string (value) not as an object
      let categoryValue = '';
      if (category == null) {
        categoryValue = '';
      } else if (typeof category === 'string') {
        categoryValue = category;
      } else if (typeof category === 'object') {
        categoryValue = category.value || category.label || JSON.stringify(category);
      } else {
        categoryValue = String(category);
      }
      formData.append('category', categoryValue);
      formData.append('createdBy', createdBy);

      const response = await fetch('/api/upload/support-file', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading support file:', error);
      throw error;
    }
  }

  return {
    processDocument,
    uploadStateDocument,
    downloadDocument,
    getDocumentUrl,
    checkDocumentExists,
    deleteCurrentDocuments,
    deleteDocumentsSend,
    uploadSupportFile,
    error,
  };
};
