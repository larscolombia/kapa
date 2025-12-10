import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfigController } from './system-config.controller';
import { SystemConfigService } from './system-config.service';
import { Client } from '../../database/entities/client.entity';
import { IlvMaestro } from '../../database/entities/ilv-maestro.entity';
import { InspeccionMaestro } from '../../database/entities/inspeccion-maestro.entity';
import { SystemParameter } from '../../database/entities/system-parameter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, IlvMaestro, InspeccionMaestro, SystemParameter]),
  ],
  controllers: [SystemConfigController],
  providers: [SystemConfigService],
  exports: [SystemConfigService],
})
export class SystemConfigModule {}
