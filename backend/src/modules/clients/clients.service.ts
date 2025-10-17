import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '@entities/client.entity';
import { ProjectsService } from '../projects/projects.service';
import { ContractorsService } from '../contractors/contractors.service';

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client)
        private clientsRepository: Repository<Client>,
        private projectsService: ProjectsService,
        private contractorsService: ContractorsService
    ) { }
    async getClients(): Promise<Client[] | undefined> {
        return this.clientsRepository.find();
    }

    async getClient(clientId: number): Promise<Client | undefined> {
        return this.clientsRepository.findOneBy({ client_id: clientId });
    }

    async getClientProjects(clientId: number, email: string, roleId: number): Promise<any[] | undefined> {
        if (roleId === 3 || roleId === 5) {
            const projects = await this.projectsService.getProjectsByClientAndContractorEmail(clientId, email);
            return projects;
        } else {
            const projects = await this.projectsService.getProjectsByClient(clientId, roleId);
            return projects;
        }
    }
}
