import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from 'src/entities/attendnace/attendance.entity';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { Family } from 'src/entities/family/family.entity';
import { User } from 'src/entities/user/user.entity';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { IAttendanceService } from '../../interfaces/attendance-service.interface';
import { AttendanceService } from '../attendance.service';

describe('Attendance Service Test', () => {
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let service: IAttendanceService;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:latest').withExposedPorts(5432).start();
  });

  afterAll(async () => {
    await container.stop();
  });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: container.getHost(),
          port: container.getPort(),
          database: container.getDatabase(),
          username: container.getUsername(),
          password: container.getPassword(),
          synchronize: true,
          entities: [Church, Family, Cell, User, Attendance],
        }),
      ],
      providers: [AttendanceService],
    }).compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    service = moduleRef.get<IAttendanceService>(AttendanceService);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('Should be defined', () => {
    expect(container).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(service).toBeDefined();
  });
});
