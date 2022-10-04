import { Module } from '@nestjs/common';
import { ChurchEntityModule } from 'src/entities/church/church.module';
import { ChurchController } from './controllers/church.controller';
import { ChurchService } from './services/church.service';

@Module({
  imports: [ChurchEntityModule],
  controllers: [ChurchController],
  providers: [
    {
      provide: 'churchService',
      useClass: ChurchService,
    },
  ],
})
export class V1ChurchModule {}
