import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtAuthGuard } from './../src/common/guards/jwt-auth.guard';
import { DataSource } from 'typeorm';

describe('ILV Reports Display (E2E)', () => {
    let app: INestApplication;
    let dataSource: DataSource;

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
        await app.init();

        dataSource = app.get(DataSource);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/ilv/reports - List with enriched data', () => {
        it('should return all reports with value_display for cliente, proyecto, and empresas fields', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/ilv/reports')
                .expect(200);

            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.total).toBeGreaterThan(0);

            // Verificar que al menos un reporte tenga campos enriquecidos
            const reportWithFields = response.body.data.find(r => r.fields && r.fields.length > 0);
            expect(reportWithFields).toBeDefined();
        });

        // Verificar reportes específicos uno por uno
        const reportTests = [
            { id: 14, expectedCliente: 'Owens Illinois (Planta Peldar Soacha)', expectedProyecto: 'Portafolio Soacha' },
            { id: 15, expectedCliente: 'Owens Illinois (Planta Peldar Soacha)', expectedProyecto: 'Soacha Major Repair' },
            { id: 16, expectedCliente: 'Owens Illinois (Planta Peldar Soacha)', expectedProyecto: 'Soacha Major Repair' },
            { id: 17, expectedCliente: 'Owens Illinois (Planta Peldar Soacha)', expectedProyecto: 'Fuel Conversion Plan Soacha' },
            { id: 18, expectedCliente: 'Owens Illinois (Planta Peldar Cogua) - ILV', expectedProyecto: 'JG126 - Zipa Add Sections F2 + Deco Cap for F2' },
            { id: 19, expectedCliente: 'Owens Illinois (Planta Peldar Soacha)', expectedProyecto: 'Soacha Major Repair' },
            { id: 20, expectedCliente: 'Owens Illinois (Planta Peldar Soacha)', expectedProyecto: 'TU685 BH Control Upgrade' },
            { id: 21, expectedCliente: 'Owens Illinois (Planta Peldar Soacha)', expectedProyecto: 'Soacha Major Repair' },
        ];

        reportTests.forEach(({ id, expectedCliente, expectedProyecto }) => {
            it(`should display human-readable values for report ${id}`, async () => {
                const response = await request(app.getHttpServer())
                    .get(`/api/ilv/reports/${id}`)
                    .expect(200);

                const report = response.body;
                expect(report.report_id).toBe(id);
                expect(report.fields).toBeDefined();
                expect(Array.isArray(report.fields)).toBe(true);

                // Verificar campo cliente
                const clienteField = report.fields.find(f => f.key === 'cliente');
                if (clienteField) {
                    expect(clienteField.value_display).toBe(expectedCliente);
                    console.log(`✓ Report ${id} - Cliente: ${clienteField.value_display}`);
                }

                // Verificar campo proyecto
                const proyectoField = report.fields.find(f => f.key === 'proyecto');
                if (proyectoField) {
                    expect(proyectoField.value_display).toContain(expectedProyecto.substring(0, 20));
                    console.log(`✓ Report ${id} - Proyecto: ${proyectoField.value_display}`);
                }

                // Verificar que ningún campo numérico muestre solo el ID
                report.fields.forEach(field => {
                    if (field.value && /^\d+$/.test(field.value)) {
                        // Si es numérico, debe tener value_display
                        expect(field.value_display).toBeDefined();
                        expect(field.value_display).not.toBe(field.value);
                        console.log(`  ${field.key}: ${field.value} → ${field.value_display}`);
                    }
                });
            });
        });

        it('should enrich empresa_pertenece and empresa_genera_reporte fields', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/ilv/reports/20')
                .expect(200);

            const report = response.body;

            const empresaGeneraField = report.fields.find(f => f.key === 'empresa_genera_reporte');
            if (empresaGeneraField && /^\d+$/.test(empresaGeneraField.value)) {
                expect(empresaGeneraField.value_display).toBeDefined();
                expect(empresaGeneraField.value_display).not.toBe(empresaGeneraField.value);
                console.log(`✓ Empresa Genera Reporte: ${empresaGeneraField.value_display}`);
            }

            const empresaPerteneceField = report.fields.find(f => f.key === 'empresa_pertenece');
            if (empresaPerteneceField && /^\d+$/.test(empresaPerteneceField.value)) {
                expect(empresaPerteneceField.value_display).toBeDefined();
                expect(empresaPerteneceField.value_display).not.toBe(empresaPerteneceField.value);
                console.log(`✓ Empresa Pertenece: ${empresaPerteneceField.value_display}`);
            }
        });
    });

    describe('Verify all reports in list view', () => {
        it('should verify that list endpoint enriches all report fields', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/ilv/reports?limit=20')
                .expect(200);

            console.log(`\n📊 Total reports: ${response.body.total}`);
            console.log(`📄 Retrieved: ${response.body.data.length} reports\n`);

            response.body.data.forEach(report => {
                console.log(`\n📝 Report #${report.report_id} (${report.tipo})`);

                const clienteField = report.fields.find(f => f.key === 'cliente');
                if (clienteField) {
                    console.log(`  Cliente: ${clienteField.value} → ${clienteField.value_display || 'NOT ENRICHED'}`);
                    if (/^\d+$/.test(clienteField.value)) {
                        expect(clienteField.value_display).toBeDefined();
                        expect(clienteField.value_display).not.toBe(clienteField.value);
                    }
                }

                const proyectoField = report.fields.find(f => f.key === 'proyecto');
                if (proyectoField) {
                    console.log(`  Proyecto: ${proyectoField.value} → ${proyectoField.value_display || 'NOT ENRICHED'}`);
                    if (/^\d+$/.test(proyectoField.value)) {
                        expect(proyectoField.value_display).toBeDefined();
                        expect(proyectoField.value_display).not.toBe(proyectoField.value);
                    }
                }
            });
        });
    });
});
