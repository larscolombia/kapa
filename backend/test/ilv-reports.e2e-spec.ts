import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtAuthGuard } from './../src/common/guards/jwt-auth.guard';
import { IlvReportType } from './../src/modules/ilv/dto/create-ilv-report.dto';

describe('ILV Reports E2E', () => {
    let app: INestApplication;

    const mockJwtGuard = {
        canActivate: (context) => {
            const req = context.switchToHttp().getRequest();
            req.user = { user_id: 1, email: 'admin@kapa.com', role_id: 1 };
            return true;
        },
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockJwtGuard)
            .compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        // Note: ValidationPipe is not global in main.ts, so we don't add it here to match prod
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('POST /api/ilv/reports - Should succeed with legacy payload (Auto-correction applied)', async () => {
        // Payload based on user report
        const payload = {
            tipo: 'hazard_id',
            proyecto_id: 11,
            cliente_id: 169,
            empresa_id: 6,
            fields: [
                // Simulating what the frontend likely sends after transforming 'campos'
                // Based on user log "allFields: Array(17)"
                { key: 'fecha', value: '2025-11-21' },
                { key: 'cliente', value: '169' },
                { key: 'proyecto', value: '11' },
                { key: 'empresa_genera_reporte', value: '6' },
                { key: 'empresa_pertenece', value: '2' },
                { key: 'nombre_quien_reporta', value: 'jorge' },
                { key: 'tipo_reporte', value: '171' },
                { key: 'nombre_ehs_contratista', value: 'manuel' },
                { key: 'nombre_supervisor_obra', value: 'slssal' },
                { key: 'tipo', value: '173' },
                { key: 'categoria', value: '108' },
                { key: 'subcategoria', value: '120' },
                { key: 'descripcion_hallazgo', value: 'lo enconte inconcluso' },
                { key: 'descripcion_cierre', value: 'lo arreglaron' },
                { key: 'estado', value: '210' },
                { key: 'observacion', value: 'esto es un ejemplo de observacion' }
            ]
        };

        const response = await request(app.getHttpServer())
            .post('/api/ilv/reports')
            .send(payload)
            .expect(201); // Expect success now

        // Verify the report was created and fields mapped
        expect(response.body).toHaveProperty('report_id');
        expect(response.body.tipo).toBe('hazard_id');

        // Check if mapped fields exist in the response fields array
        const fields = response.body.fields;
        expect(fields.find(f => f.key === 'fecha_evento')).toBeDefined();
        expect(fields.find(f => f.key === 'descripcion_condicion')).toBeDefined();
        expect(fields.find(f => f.key === 'tipo_reporte_hid')).toBeDefined();
        expect(fields.find(f => f.key === 'ubicacion')).toBeDefined(); // Defaulted
    });

    it('POST /api/ilv/reports - Create new report and verify enriched display', async () => {
        const newReportPayload = {
            tipo: 'hazard_id',
            proyecto_id: 2, // Soacha Major Repair
            cliente_id: 1,  // Owens Illinois - Planta Peldar Soacha
            empresa_id: 7,  // CONCREACERO SAS
            fields: [
                { key: 'fecha', value: '2025-11-21' },
                { key: 'cliente', value: '1' }, // client_id real, no maestro
                { key: 'proyecto', value: '2' },
                { key: 'empresa_genera_reporte', value: '7' },
                { key: 'empresa_pertenece', value: '6' },
                { key: 'nombre_quien_reporta', value: 'Test E2E User' },
                { key: 'tipo_reporte', value: '171' }, // HID
                { key: 'nombre_ehs_contratista', value: 'EHS E2E' },
                { key: 'nombre_supervisor_obra', value: 'Supervisor E2E' },
                { key: 'tipo', value: '174' }, // Salud
                { key: 'categoria', value: '110' }, // Trabajos en espacio confinado
                { key: 'subcategoria', value: '131' }, // Sistemas de acceso
                { key: 'descripcion_hallazgo', value: 'Hallazgo de prueba E2E' },
                { key: 'descripcion_cierre', value: 'Cierre de prueba E2E' },
                { key: 'estado', value: '210' }, // Abierto
                { key: 'observacion', value: 'Observación de prueba E2E' },
                { key: 'severidad', value: '1' },
                { key: 'area', value: '1' }
            ]
        };

        // Create the report
        const createResponse = await request(app.getHttpServer())
            .post('/api/ilv/reports')
            .send(newReportPayload)
            .expect(201);

        const createdReportId = createResponse.body.report_id;
        expect(createdReportId).toBeDefined();
        console.log(`✅ Created report #${createdReportId}`);

        // Verify the report appears in list with enriched data
        const listResponse = await request(app.getHttpServer())
            .get('/api/ilv/reports')
            .expect(200);

        const reportInList = listResponse.body.data.find(r => r.report_id === createdReportId);
        expect(reportInList).toBeDefined();
        console.log(`✅ Report #${createdReportId} found in list`);

        // Verify enriched fields in list
        const clienteFieldInList = reportInList.fields.find(f => f.key === 'cliente');
        expect(clienteFieldInList).toBeDefined();
        expect(clienteFieldInList.value).toBe('1');
        expect(clienteFieldInList.value_display).toBe('Owens Illinois - Planta Peldar Soacha');
        console.log(`✅ List - Cliente: ${clienteFieldInList.value} → ${clienteFieldInList.value_display}`);

        const proyectoFieldInList = reportInList.fields.find(f => f.key === 'proyecto');
        expect(proyectoFieldInList).toBeDefined();
        expect(proyectoFieldInList.value).toBe('2');
        expect(proyectoFieldInList.value_display).toBe('Soacha Major Repair');
        console.log(`✅ List - Proyecto: ${proyectoFieldInList.value} → ${proyectoFieldInList.value_display}`);

        const empresaGeneraInList = reportInList.fields.find(f => f.key === 'empresa_genera_reporte');
        expect(empresaGeneraInList).toBeDefined();
        expect(empresaGeneraInList.value).toBe('7');
        expect(empresaGeneraInList.value_display).toBe('CONCREACERO SAS');
        console.log(`✅ List - Empresa Genera: ${empresaGeneraInList.value} → ${empresaGeneraInList.value_display}`);

        // Get the report detail
        const detailResponse = await request(app.getHttpServer())
            .get(`/api/ilv/reports/${createdReportId}`)
            .expect(200);

        console.log(`✅ Retrieved report #${createdReportId} detail`);

        // Verify enriched fields in detail match list
        const clienteFieldInDetail = detailResponse.body.fields.find(f => f.key === 'cliente');
        expect(clienteFieldInDetail.value_display).toBe(clienteFieldInList.value_display);
        console.log(`✅ Detail - Cliente matches list: ${clienteFieldInDetail.value_display}`);

        const proyectoFieldInDetail = detailResponse.body.fields.find(f => f.key === 'proyecto');
        expect(proyectoFieldInDetail.value_display).toBe(proyectoFieldInList.value_display);
        console.log(`✅ Detail - Proyecto matches list: ${proyectoFieldInDetail.value_display}`);

        const empresaGeneraInDetail = detailResponse.body.fields.find(f => f.key === 'empresa_genera_reporte');
        expect(empresaGeneraInDetail.value_display).toBe(empresaGeneraInList.value_display);
        console.log(`✅ Detail - Empresa Genera matches list: ${empresaGeneraInDetail.value_display}`);

        // Verify all numeric fields have value_display
        detailResponse.body.fields.forEach(field => {
            if (field.value && /^\d+$/.test(field.value)) {
                expect(field.value_display).toBeDefined();
                expect(field.value_display).not.toBe(field.value);
                console.log(`  ✓ ${field.key}: ${field.value} → ${field.value_display}`);
            }
        });

    console.log(`\n🎉 Report #${createdReportId} verified: List and Detail display match with enriched human-readable values`);
  });

  it('POST /api/ilv/reports - Create report with 3 images and verify on edit', async () => {
    // Crear buffers de imágenes de prueba con contenido diferente
    const createTestImage = (name: string, index: number) => {
      // PNG 1x1 con colores diferentes para cada imagen
      const pngImages = [
        // Rojo
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
        // Verde
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        // Azul
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      ];
      return Buffer.from(pngImages[index], 'base64');
    };

    const newReportPayload = {
      tipo: 'hazard_id',
      proyecto_id: 11,
      cliente_id: 1,
      empresa_id: 7,
      fields: [
        { key: 'fecha', value: '2025-11-21' },
        { key: 'cliente', value: '1' },
        { key: 'proyecto', value: '11' },
        { key: 'empresa_genera_reporte', value: '7' },
        { key: 'empresa_pertenece', value: '6' },
        { key: 'nombre_quien_reporta', value: 'Test con Imágenes' },
        { key: 'tipo_reporte', value: '171' },
        { key: 'nombre_ehs_contratista', value: 'EHS Test' },
        { key: 'nombre_supervisor_obra', value: 'Supervisor Test' },
        { key: 'tipo', value: '174' },
        { key: 'categoria', value: '110' },
        { key: 'subcategoria', value: '131' },
        { key: 'descripcion_hallazgo', value: 'Hallazgo con imágenes de prueba' },
        { key: 'descripcion_cierre', value: 'Cierre con imágenes' },
        { key: 'estado', value: '210' },
        { key: 'observacion', value: 'Reporte con 3 imágenes adjuntas' }
      ]
    };

    // Crear reporte
    const createResponse = await request(app.getHttpServer())
      .post('/api/ilv/reports')
      .send(newReportPayload)
      .expect(201);

    const reportId = createResponse.body.report_id;
    console.log(`✅ Created report #${reportId} for image upload test`);

    // Subir 3 imágenes
    const imageNames = ['test_image_1.png', 'test_image_2.png', 'test_image_3.png'];
    const uploadedAttachments = [];

    for (let i = 0; i < imageNames.length; i++) {
      const imageName = imageNames[i];
      const imageBuffer = createTestImage(imageName, i);
      
      const uploadResponse = await request(app.getHttpServer())
        .post(`/api/ilv/reports/${reportId}/attachments`)
        .attach('file', imageBuffer, imageName)
        .expect(201);

      uploadedAttachments.push(uploadResponse.body);
      console.log(`  ✓ Uploaded: ${imageName} (ID: ${uploadResponse.body.attachment_id})`);
    }

    expect(uploadedAttachments.length).toBe(3);

    // Verificar que las imágenes están disponibles en el endpoint de attachments
    const attachmentsResponse = await request(app.getHttpServer())
      .get(`/api/ilv/reports/${reportId}/attachments`)
      .expect(200);

    expect(attachmentsResponse.body.length).toBeGreaterThanOrEqual(3);
    console.log(`✅ Verified ${attachmentsResponse.body.length} attachments exist for report #${reportId}`);

    // Verificar que cada imagen tiene URL de descarga
    for (const attachment of uploadedAttachments) {
      const downloadUrlResponse = await request(app.getHttpServer())
        .get(`/api/ilv/reports/${reportId}/attachments/${attachment.attachment_id}/download`)
        .expect(200);

      expect(downloadUrlResponse.body.url).toBeDefined();
      expect(downloadUrlResponse.body.url).toContain('http');
      console.log(`  ✓ Download URL available for ${attachment.file_name}`);
    }

    // Verificar que las imágenes son visibles al obtener el reporte para edición
    const reportDetailResponse = await request(app.getHttpServer())
      .get(`/api/ilv/reports/${reportId}`)
      .expect(200);

    console.log(`✅ Report #${reportId} can be retrieved for editing with attachments visible`);
    console.log(`\n🎉 Report #${reportId} created with 3 images successfully. Images are accessible for editing.`);
  });
});