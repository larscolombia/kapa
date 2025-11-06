import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportsService } from './supports.service';
import { SupportsController } from './supports.controller';
import { UploadController } from './upload.controller';
import { SupportFile } from '@entities/support-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SupportFile])],
  providers: [SupportsService],
  controllers: [SupportsController, UploadController],
  exports: [SupportsService],
})
export class SupportsModule { }