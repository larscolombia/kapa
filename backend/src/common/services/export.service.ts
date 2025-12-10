import * as ExcelJS from 'exceljs';
import { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';
import * as fs from 'fs';
import * as path from 'path';

// Importar pdfmake de forma correcta para Node.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PdfPrinter = require('pdfmake');

// Para servidor, usar fuentes del sistema estándar de PDF
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

let printer: any = null;
try {
  printer = new PdfPrinter(fonts);
} catch (e) {
  console.error('Error initializing PDF printer:', e);
}

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelExportOptions {
  title: string;
  subtitle?: string;
  columns: ExcelColumn[];
  data: Record<string, any>[];
  sheetName?: string;
}

export interface PdfReportData {
  titulo: string;
  subtitulo?: string;
  fechaGeneracion: Date;
  secciones: PdfSection[];
  logoBase64?: string;
}

export interface PdfSection {
  titulo: string;
  campos: { label: string; value: string | number | null }[];
  tabla?: {
    headers: string[];
    rows: (string | number)[][];
  };
}

export class ExportService {
  private static logoBase64: string | null = null;

  /**
   * Cargar el logo de la plataforma
   */
  private static getLogoBase64(): string {
    if (this.logoBase64) return this.logoBase64;

    try {
      // Intentar cargar el logo desde múltiples ubicaciones
      const possiblePaths = [
        path.join(__dirname, '../../assets/logo-kapa.png'),
        path.join(__dirname, '../../../src/assets/logo-kapa.png'),
        path.join(process.cwd(), 'src/assets/logo-kapa.png'),
        path.join(process.cwd(), 'dist/assets/logo-kapa.png'),
      ];

      for (const logoPath of possiblePaths) {
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath);
          this.logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
          console.log('Logo cargado desde:', logoPath);
          return this.logoBase64;
        }
      }

      console.warn('No se encontró el logo en ninguna ubicación');
    } catch (error) {
      console.warn('No se pudo cargar el logo:', error);
    }

    // Logo por defecto en base64 (un placeholder simple)
    return '';
  }

  /**
   * Generar archivo Excel profesional
   */
  static async generateExcel(options: ExcelExportOptions): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'KAPA - Plataforma de Gestión';
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet(options.sheetName || 'Reporte', {
      properties: { tabColor: { argb: 'FF4A90A4' } },
      views: [{ state: 'frozen', ySplit: 3 }]
    });

    // Título del reporte
    worksheet.mergeCells('A1:' + this.getColumnLetter(options.columns.length) + '1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = options.title;
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF4A90A4' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Subtítulo
    if (options.subtitle) {
      worksheet.mergeCells('A2:' + this.getColumnLetter(options.columns.length) + '2');
      const subtitleCell = worksheet.getCell('A2');
      subtitleCell.value = options.subtitle;
      subtitleCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: 'FF666666' } };
      subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    }

    // Headers de columnas
    const headerRow = worksheet.getRow(3);
    options.columns.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = col.header;
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4A90A4' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF333333' } },
        left: { style: 'thin', color: { argb: 'FF333333' } },
        bottom: { style: 'thin', color: { argb: 'FF333333' } },
        right: { style: 'thin', color: { argb: 'FF333333' } }
      };
    });
    headerRow.height = 25;

    // Configurar anchos de columnas
    options.columns.forEach((col, index) => {
      worksheet.getColumn(index + 1).width = col.width || 15;
    });

    // Datos
    options.data.forEach((row, rowIndex) => {
      const dataRow = worksheet.getRow(rowIndex + 4);
      options.columns.forEach((col, colIndex) => {
        const cell = dataRow.getCell(colIndex + 1);
        let value = row[col.key];
        
        // Formatear valores especiales
        if (value instanceof Date) {
          value = value.toLocaleDateString('es-CO');
        } else if (value === null || value === undefined) {
          value = '';
        }
        
        cell.value = value;
        cell.font = { name: 'Arial', size: 10 };
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };

        // Alternar colores de filas
        if (rowIndex % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
          };
        }
      });
    });

    // Agregar fila de totales/info
    const footerRow = worksheet.getRow(options.data.length + 5);
    worksheet.mergeCells(`A${options.data.length + 5}:${this.getColumnLetter(options.columns.length)}${options.data.length + 5}`);
    const footerCell = footerRow.getCell(1);
    footerCell.value = `Total de registros: ${options.data.length} | Generado el: ${new Date().toLocaleString('es-CO')}`;
    footerCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF666666' } };
    footerCell.alignment = { horizontal: 'right' };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Generar PDF profesional de un reporte individual
   */
  static async generatePdf(reportData: PdfReportData): Promise<Buffer> {
    console.log('[ExportService] Starting PDF generation');
    
    // Construir el contenido del documento
    const content: Content[] = [];

    // Header sin logo para evitar problemas
    const headerContent: Content = {
      columns: [
        {
          stack: [
            { text: 'KAPA', style: 'brand', margin: [0, 5, 0, 0] },
            { text: 'Protegiendo Vidas', style: 'brandSubtitle' },
          ],
          width: 'auto'
        },
        {
          stack: [
            { text: reportData.titulo, style: 'reportTitle', alignment: 'right' },
            reportData.subtitulo ? { text: reportData.subtitulo, style: 'reportSubtitle', alignment: 'right' } : '',
          ],
          width: '*'
        }
      ],
      margin: [0, 0, 0, 20]
    };

    content.push(headerContent);

    // Línea separadora
    content.push({
      canvas: [
        {
          type: 'line',
          x1: 0, y1: 0,
          x2: 515, y2: 0,
          lineWidth: 2,
          lineColor: '#4A90A4'
        }
      ],
      margin: [0, 0, 0, 20]
    } as Content);

    // Secciones del reporte
    for (const seccion of reportData.secciones) {
      // Título de la sección
      content.push({
        text: seccion.titulo,
        style: 'sectionTitle',
        margin: [0, 10, 0, 10]
      });

      // Campos de la sección en formato de tabla de 2 columnas
      if (seccion.campos && seccion.campos.length > 0) {
        const tableBody: TableCell[][] = [];
        
        for (let i = 0; i < seccion.campos.length; i += 2) {
          const row: TableCell[] = [];
          
          // Primer campo
          row.push({
            text: seccion.campos[i].label + ':',
            style: 'fieldLabel',
            border: [false, false, false, true],
            borderColor: ['#E0E0E0', '#E0E0E0', '#E0E0E0', '#E0E0E0']
          });
          row.push({
            text: this.formatValue(seccion.campos[i].value),
            style: 'fieldValue',
            border: [false, false, false, true],
            borderColor: ['#E0E0E0', '#E0E0E0', '#E0E0E0', '#E0E0E0']
          });

          // Segundo campo (si existe)
          if (i + 1 < seccion.campos.length) {
            row.push({
              text: seccion.campos[i + 1].label + ':',
              style: 'fieldLabel',
              border: [false, false, false, true],
              borderColor: ['#E0E0E0', '#E0E0E0', '#E0E0E0', '#E0E0E0']
            });
            row.push({
              text: this.formatValue(seccion.campos[i + 1].value),
              style: 'fieldValue',
              border: [false, false, false, true],
              borderColor: ['#E0E0E0', '#E0E0E0', '#E0E0E0', '#E0E0E0']
            });
          } else {
            row.push({ text: '', border: [false, false, false, false] });
            row.push({ text: '', border: [false, false, false, false] });
          }

          tableBody.push(row);
        }

        content.push({
          table: {
            headerRows: 0,
            widths: ['20%', '30%', '20%', '30%'],
            body: tableBody
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 0,
            hLineColor: () => '#E0E0E0'
          },
          margin: [0, 0, 0, 15]
        });
      }

      // Tabla adicional si existe
      if (seccion.tabla) {
        const tableBody: TableCell[][] = [
          seccion.tabla.headers.map(h => ({
            text: h,
            style: 'tableHeader',
            fillColor: '#4A90A4',
            color: 'white'
          }))
        ];

        seccion.tabla.rows.forEach((row, index) => {
          tableBody.push(row.map(cell => ({
            text: String(cell),
            style: 'tableCell',
            fillColor: index % 2 === 0 ? '#F5F5F5' : 'white'
          })));
        });

        content.push({
          table: {
            headerRows: 1,
            widths: Array(seccion.tabla.headers.length).fill('*'),
            body: tableBody
          },
          margin: [0, 10, 0, 20]
        });
      }
    }

    // Footer
    content.push({
      canvas: [
        {
          type: 'line',
          x1: 0, y1: 0,
          x2: 515, y2: 0,
          lineWidth: 1,
          lineColor: '#E0E0E0'
        }
      ],
      margin: [0, 20, 0, 10]
    } as Content);

    content.push({
      columns: [
        { text: `Generado el: ${reportData.fechaGeneracion.toLocaleString('es-CO')}`, style: 'footer' },
        { text: 'KAPA - Sistema de Gestión', style: 'footer', alignment: 'right' }
      ]
    });

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageMargins: [40, 40, 40, 40],
      content,
      styles: {
        brand: {
          fontSize: 18,
          bold: true,
          color: '#4A90A4'
        },
        brandSubtitle: {
          fontSize: 10,
          color: '#666666'
        },
        reportTitle: {
          fontSize: 16,
          bold: true,
          color: '#333333'
        },
        reportSubtitle: {
          fontSize: 11,
          color: '#666666'
        },
        sectionTitle: {
          fontSize: 13,
          bold: true,
          color: '#4A90A4',
          decoration: 'underline'
        },
        fieldLabel: {
          fontSize: 9,
          color: '#666666',
          margin: [0, 5, 0, 5]
        },
        fieldValue: {
          fontSize: 10,
          color: '#333333',
          margin: [0, 5, 0, 5]
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          margin: [5, 5, 5, 5]
        },
        tableCell: {
          fontSize: 9,
          margin: [5, 3, 5, 3]
        },
        footer: {
          fontSize: 8,
          color: '#999999'
        }
      },
      defaultStyle: {
        font: 'Helvetica'
      }
    };

    console.log('[ExportService] Creating PDF document...');
    
    return new Promise((resolve, reject) => {
      try {
        if (!printer) {
          console.error('[ExportService] PDF printer not initialized');
          throw new Error('PDF printer not initialized');
        }
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];
        
        pdfDoc.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        
        pdfDoc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          console.log(`[ExportService] PDF generated successfully, size: ${buffer.length} bytes`);
          resolve(buffer);
        });
        
        pdfDoc.on('error', (err: Error) => {
          console.error('[ExportService] PDF generation error:', err);
          reject(err);
        });
        
        pdfDoc.end();
      } catch (error) {
        console.error('[ExportService] Error creating PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Convertir número de columna a letra de Excel (1 = A, 2 = B, etc.)
   */
  private static getColumnLetter(num: number): string {
    let letter = '';
    while (num > 0) {
      const remainder = (num - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      num = Math.floor((num - 1) / 26);
    }
    return letter;
  }

  /**
   * Formatear valores para mostrar en PDF
   */
  private static formatValue(value: string | number | null): string {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    if (typeof value === 'number') {
      return value.toLocaleString('es-CO');
    }
    return String(value);
  }
}
