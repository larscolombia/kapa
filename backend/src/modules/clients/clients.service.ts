import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '@entities/client.entity';
import { ProjectsService } from '../projects/projects.service';
import { ContractorsService } from '../contractors/contractors.service';
import { IlvMaestrosService } from '../ilv/services/ilv-maestros.service';

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client)
        private clientsRepository: Repository<Client>,
        private projectsService: ProjectsService,
        private contractorsService: ContractorsService,
        private ilvMaestrosService: IlvMaestrosService
    ) { }
    async getClients(): Promise<Client[] | undefined> {
        return this.clientsRepository.find();
    }

    async getClient(clientId: number): Promise<Client | undefined> {
        return this.clientsRepository.findOneBy({ client_id: clientId });
    }

    async getClientProjects(clientId: number, email: string, roleId: number): Promise<any[] | undefined> {
        let projects = [];

        // Intentar obtener proyectos con el ID proporcionado
        if (roleId === 3 || roleId === 5) {
            projects = await this.projectsService.getProjectsByClientAndContractorEmail(clientId, email);
        } else {
            projects = await this.projectsService.getProjectsByClient(clientId, roleId);
        }

        // AUTOCORRECCIÓN: Si no se encuentran proyectos, verificar si es un problema de ID desalineado
        if (!projects || projects.length === 0) {
            console.log(`⚠️ No projects found for client ${clientId}. Attempting auto-correction...`);

            try {
                // 1. Buscar si existe un maestro con ese ID (que sería el origen del ID incorrecto)
                // Accedemos al repositorio directamente o a través de un método público si existiera
                // Como no tenemos acceso directo al repo de maestros aquí, usamos el servicio si tiene un método findOne
                // Pero IlvMaestrosService no tiene findOne público por ID genérico, solo update/delete
                // Vamos a asumir que el ID viene de un maestro tipo 'centro_trabajo'

                // Hack: Usamos getMaestrosTree o findByTipo para buscar en memoria, o mejor, añadimos un método en IlvMaestrosService
                // Por ahora, intentaremos buscar por nombre en la tabla de clientes si el ID no coincide

                // Buscar el cliente actual para ver su nombre (si existe)
                const client = await this.clientsRepository.findOneBy({ client_id: clientId });

                if (!client) {
                    // El cliente con ese ID no existe en la tabla client.
                    // Esto sugiere que el ID viene de otro lado (ej: ilv_maestro)
                    // Intentemos buscar en ilv_maestro para ver qué nombre tiene
                    const maestros = await this.ilvMaestrosService.findByTipo('centro_trabajo');
                    const maestro = maestros.find(m => m.maestro_id == clientId);

                    if (maestro) {
                        console.log(`🔄 Found matching maestro: "${maestro.valor}" (ID: ${maestro.maestro_id})`);

                        // Buscar cliente real por nombre (fuzzy match simple)
                        const realClient = await this.clientsRepository
                            .createQueryBuilder('client')
                            .where('LOWER(client.name) LIKE LOWER(:name)', { name: `%${maestro.valor.substring(0, 10)}%` }) // Match primeros 10 chars
                            .getOne();

                        if (realClient) {
                            console.log(`✅ Auto-corrected: Redirecting to client "${realClient.name}" (ID: ${realClient.client_id})`);

                            // Reintentar búsqueda con el ID real
                            if (roleId === 3 || roleId === 5) {
                                projects = await this.projectsService.getProjectsByClientAndContractorEmail(realClient.client_id, email);
                            } else {
                                projects = await this.projectsService.getProjectsByClient(realClient.client_id, roleId);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('❌ Auto-correction failed:', err);
            }
        }

        return projects;
    }

    async getClientContractors(clientId: number): Promise<any[] | undefined> {
        // Obtener todos los contratistas únicos asociados a proyectos del cliente
        let result = await this.clientsRepository
            .createQueryBuilder('client')
            .innerJoin('client.projects', 'project')
            .innerJoin('project.projectContractors', 'project_contractor')
            .innerJoin('project_contractor.contractor', 'contractor')
            .select([
                'DISTINCT contractor.contractor_id AS contractor_id',
                'contractor.name AS contractor_name',
                'contractor.name AS name'
            ])
            .where('client.client_id = :clientId', { clientId })
            .getRawMany();

        // AUTOCORRECCIÓN para contratistas
        if (!result || result.length === 0) {
            try {
                const maestros = await this.ilvMaestrosService.findByTipo('centro_trabajo');
                const maestro = maestros.find(m => m.maestro_id == clientId);

                if (maestro) {
                    const realClient = await this.clientsRepository
                        .createQueryBuilder('client')
                        .where('LOWER(client.name) LIKE LOWER(:name)', { name: `%${maestro.valor.substring(0, 10)}%` })
                        .getOne();

                    if (realClient) {
                        console.log(`✅ Auto-corrected Contractors: Redirecting to client "${realClient.name}" (ID: ${realClient.client_id})`);
                        result = await this.clientsRepository
                            .createQueryBuilder('client')
                            .innerJoin('client.projects', 'project')
                            .innerJoin('project.projectContractors', 'project_contractor')
                            .innerJoin('project_contractor.contractor', 'contractor')
                            .select([
                                'DISTINCT contractor.contractor_id AS contractor_id',
                                'contractor.name AS contractor_name',
                                'contractor.name AS name'
                            ])
                            .where('client.client_id = :clientId', { clientId: realClient.client_id })
                            .getRawMany();
                    }
                }
            } catch (err) {
                console.error('❌ Auto-correction failed for contractors:', err);
            }
        }

        return result;
    }
}
