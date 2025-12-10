import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { FormTemplate } from '../../database/entities/form-template.entity';
import { FormTemplateClassification } from '../../database/entities/form-template-classification.entity';
import { FormSubmission } from '../../database/entities/form-submission.entity';
import { FormDraft } from '../../database/entities/form-draft.entity';
import { FormSubmissionHistory } from '../../database/entities/form-submission-history.entity';
import { InspeccionMaestro } from '../../database/entities/inspeccion-maestro.entity';
import { InspeccionReport } from '../../database/entities/inspeccion-report.entity';

// Services
import { FormTemplateService } from './services/form-template.service';
import { FormSubmissionService } from './services/form-submission.service';
import { FormDraftService } from './services/form-draft.service';

// Controllers
import { FormTemplateController } from './controllers/form-template.controller';
import { FormSubmissionController } from './controllers/form-submission.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FormTemplate,
      FormTemplateClassification,
      FormSubmission,
      FormDraft,
      FormSubmissionHistory,
      InspeccionMaestro,
      InspeccionReport,
    ]),
  ],
  providers: [
    FormTemplateService,
    FormSubmissionService,
    FormDraftService,
  ],
  controllers: [
    FormTemplateController,
    FormSubmissionController,
  ],
  exports: [
    FormTemplateService,
    FormSubmissionService,
    FormDraftService,
  ],
})
export class FormBuilderModule {}
