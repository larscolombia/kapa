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
        const url = await awsS3.readFile(urlDoc + document.name);
        return { url, name: document.name };
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

  return {
    processDocument,
    uploadStateDocument,
    downloadDocument,
    deleteCurrentDocuments,
    deleteDocumentsSend,
    error,
  };
};
