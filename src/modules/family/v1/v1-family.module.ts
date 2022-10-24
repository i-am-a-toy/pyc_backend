import { Module } from '@nestjs/common';
import { FamilyEntityModule } from 'src/entities/family/family-entity.module';
import { FamilyController } from './controllers/family.controller';
import { FamilyService } from './servicies/family.service';

@Module({
  imports: [FamilyEntityModule],
  controllers: [FamilyController],
  providers: [
    {
      provide: 'familyService',
      useClass: FamilyService,
    },
  ],
})
export class V1FamilyModule {}
