import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';
import { Client } from '@entities/client.entity';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import { ContractorsModule } from '../contractors/contractors.module';

@Module({
  imports: [TypeOrmModule.forFeature([Client]), AuthModule, ProjectsModule, ContractorsModule],
  providers: [ClientsService],
  exports: [ClientsService],
  controllers: [ClientsController],
})
export class ClientsModule {}
