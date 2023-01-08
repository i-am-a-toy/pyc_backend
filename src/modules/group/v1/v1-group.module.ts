import { Module } from '@nestjs/common';
import { CellRepositoryModule } from 'src/entities/cell/cell-repository.module';
import { ChurchRepositoryModule } from 'src/entities/church/church-repository.module';
import { GroupRepositoryModule } from 'src/entities/group/group-repository.module';
import { UserRepositoryModule } from 'src/entities/user/user-repository.module';
import { GroupModule } from '../group.module';
import { GroupService } from './services/group.service';

export const GROUP_SERVICE_KEY = 'groupServiceKey';

@Module({
  imports: [ChurchRepositoryModule, GroupRepositoryModule, CellRepositoryModule, UserRepositoryModule],
  controllers: [GroupModule],
  providers: [
    {
      provide: GROUP_SERVICE_KEY,
      useClass: GroupService,
    },
  ],
})
export class V1FamilyModule {}
