import { createNamespace, destroyNamespace, Namespace } from 'cls-hooked';
import { TransactionManager } from 'src/core/database/typeorm/transaction.manager';
import { PYC_NAMESPACE } from 'src/core/database/typeorm/transaction.middleware';
import { ICellRepository } from 'src/entities/cell/cell-repository.interface';
import { Cell } from 'src/entities/cell/cell.entity';
import { CellRepository } from 'src/entities/cell/cell.repository';
import { IChurchRepository } from 'src/entities/church/church-repository.interface';
import { Church } from 'src/entities/church/church.entity';
import { ChurchRepository } from 'src/entities/church/church.repository';
import { IGroupRepository } from 'src/entities/group/group-repository.interface';
import { Group } from 'src/entities/group/group.entity';
import { GroupRepository } from 'src/entities/group/group.repository';
import { IUserRepository } from 'src/entities/user/user-repository.interface';
import { User } from 'src/entities/user/user.entity';
import { UserRepository } from 'src/entities/user/user.repository';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { ICellService } from '../../interfaces/cell-service.interface';
import { CellService } from '../cell.service';

describe('CellService Test', () => {
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let churchRepository: IChurchRepository;
  let groupRepository: IGroupRepository;
  let cellRepository: ICellRepository;
  let userRepository: IUserRepository;
  let service: ICellService;
  let nameSpace: Namespace;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:latest').withExposedPorts(5432).start();
    dataSource = new DataSource({
      type: 'postgres',
      host: container.getHost(),
      port: container.getPort(),
      database: container.getDatabase(),
      username: container.getUsername(),
      password: container.getPassword(),
      synchronize: true,
      entities: [Church, Group, Cell, User],
      // logging: true,
    });
    await dataSource.initialize();

    const txManager = new TransactionManager();
    churchRepository = new ChurchRepository(txManager);
    groupRepository = new GroupRepository(txManager);
    cellRepository = new CellRepository(txManager);
    userRepository = new UserRepository(txManager);
    service = new CellService(churchRepository, groupRepository, cellRepository, userRepository);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await container.stop();
  });

  beforeEach(() => {
    nameSpace = createNamespace(PYC_NAMESPACE);
  });

  afterEach(async () => {
    await dataSource.query('TRUNCATE TABLE churches cascade');
    await dataSource.query('ALTER SEQUENCE churches_id_seq RESTART WITH 1');
    await dataSource.query('TRUNCATE TABLE groups cascade');
    await dataSource.query('ALTER SEQUENCE groups_id_seq RESTART WITH 1');
    await dataSource.query('TRUNCATE TABLE cells cascade');
    await dataSource.query('ALTER SEQUENCE cells_id_seq RESTART WITH 1');
    await dataSource.query('TRUNCATE TABLE users cascade');
    await dataSource.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    destroyNamespace(PYC_NAMESPACE);
  });

  it('Should be defined', () => {
    expect(container).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(churchRepository).toBeDefined();
    expect(groupRepository).toBeDefined();
    expect(cellRepository).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(service).toBeDefined();
    expect(nameSpace).toBeDefined();
  });
});
