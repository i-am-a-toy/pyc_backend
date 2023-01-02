import { Module } from '@nestjs/common';
import { GroupEntityModule } from 'src/entities/group/group-entity.module';
import { GroupModule } from '../group.module';
import { GroupService } from './services/group.service';

const GROUP_SERVICE_KEY = 'groupServiceKey';

@Module({
  imports: [GroupEntityModule],
  controllers: [GroupModule],
  providers: [
    {
      provide: GROUP_SERVICE_KEY,
      useClass: GroupService,
    },
  ],
})
export class V1FamilyModule {}
