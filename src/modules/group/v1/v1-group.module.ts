import { ClassProvider, Module } from '@nestjs/common';
import { CellRepositoryModule } from 'src/entities/cell/cell-repository.module';
import { ChurchRepositoryModule } from 'src/entities/church/church-repository.module';
import { GroupRepositoryModule } from 'src/entities/group/group-repository.module';
import { UserRepositoryModule } from 'src/entities/user/user-repository.module';
import { GroupController } from './controllers/group.controller';
import { GroupService, GroupServiceKey } from './services/group.service';

const groupService: ClassProvider = {
  provide: GroupServiceKey,
  useClass: GroupService,
};

@Module({
  imports: [ChurchRepositoryModule, GroupRepositoryModule, CellRepositoryModule, UserRepositoryModule],
  providers: [groupService],
  controllers: [GroupController],
})
export class V1GroupModule {}
