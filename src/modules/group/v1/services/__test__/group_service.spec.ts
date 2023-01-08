import { ConflictException, NotFoundException } from '@nestjs/common';
import { createNamespace, destroyNamespace, Namespace } from 'cls-hooked';
import { TransactionManager } from 'src/core/database/typeorm/transaction.manager';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from 'src/core/database/typeorm/transaction.middleware';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateGroupRequest } from 'src/dto/group/requests/create-group.request';
import { GroupListResponse } from 'src/dto/group/responses/group-list.response';
import { UserResponse } from 'src/dto/user/responses/user.response';
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
import { Role } from 'src/types/role/role.type';
import { mockChurchs } from 'src/utils/mocks/churches/mock';
import { getMockUsers } from 'src/utils/mocks/users/mock';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { IGroupService } from '../../interfaces/group-service.interface';
import { GroupService } from '../group.service';

describe('Group Service Test', () => {
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let churchRepository: IChurchRepository;
  let groupRepository: IGroupRepository;
  let cellRepository: ICellRepository;
  let userRepository: IUserRepository;
  let groupService: IGroupService;
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
      logging: true,
    });
    await dataSource.initialize();

    const txManager = new TransactionManager();
    churchRepository = new ChurchRepository(txManager);
    groupRepository = new GroupRepository(txManager);
    cellRepository = new CellRepository(txManager);
    userRepository = new UserRepository(txManager);
    groupService = new GroupService(churchRepository, groupRepository, cellRepository, userRepository);
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
    expect(container).toBeDefined;
    expect(dataSource).toBeDefined;
    expect(churchRepository).toBeDefined;
    expect(groupRepository).toBeDefined;
    expect(cellRepository).toBeDefined;
    expect(userRepository).toBeDefined;
    expect(groupService).toBeDefined;
  });

  it('Save Test - Church가 존재하지 않는 경우', async () => {
    //given
    const pycUser = new PycUser('1', 1, 1, 'foobar', Role.LEADER);
    const req: CreateGroupRequest = { leaderId: 1, name: 'foobar' };

    //when
    //then
    await expect(
      nameSpace.runPromise(async () => {
        await Promise.resolve().then(() => nameSpace.set(PYC_ENTITY_MANAGER, dataSource.createEntityManager()));
        await groupService.save(pycUser, req);
      }),
    ).rejects.toThrowError(new NotFoundException(`교회를 찾을 수 없습니다.`));
  });

  it('Save Test - 이름이 중복된 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, getMockUsers(churchA));
    await dataSource.manager.save(Group, [
      Group.of(churchA, leaderA, 'groupA', leaderA.id),
      Group.of(churchA, leaderB, 'groupB', leaderB.id),
    ]);
    const pycUser = new PycUser('1', churchA.id, 1, 'foobar', Role.LEADER);
    const req: CreateGroupRequest = { leaderId: 3, name: 'groupA' };

    //when
    //then
    await expect(
      nameSpace.runPromise(async () => {
        await Promise.resolve().then(() => nameSpace.set(PYC_ENTITY_MANAGER, dataSource.createEntityManager()));
        await groupService.save(pycUser, req);
      }),
    ).rejects.toThrowError(new ConflictException(`이미 존재하는 이름입니다.`));
  });

  it('Save Test - 리더가 존재하지 않는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, getMockUsers(churchA));
    await dataSource.manager.save(Group, [
      Group.of(churchA, leaderA, 'groupA', leaderA.id),
      Group.of(churchA, leaderB, 'groupB', leaderB.id),
    ]);
    const pycUser = new PycUser('1', churchA.id, 1, 'foobar', Role.LEADER);
    const req: CreateGroupRequest = { leaderId: 999, name: 'groupC' };

    //when
    //then
    await expect(
      nameSpace.runPromise(async () => {
        await Promise.resolve().then(() => nameSpace.set(PYC_ENTITY_MANAGER, dataSource.createEntityManager()));
        await groupService.save(pycUser, req);
      }),
    ).rejects.toThrowError(new NotFoundException('리더를 찾을 수 없습니다.'));
  });

  it('Save Test', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, getMockUsers(churchA));
    const pycUser = new PycUser('1', churchA.id, 1, 'foobar', Role.LEADER);
    const req: CreateGroupRequest = { leaderId: leaderA.id, name: 'groupA' };

    //when
    //then
    await expect(
      nameSpace.runPromise(async () => {
        await Promise.resolve().then(() => nameSpace.set(PYC_ENTITY_MANAGER, dataSource.createEntityManager()));
        await groupService.save(pycUser, req);
      }),
    ).resolves.not.toThrowError();
  });

  it('findAll Test - 조회결과가 없을 때', async () => {
    //given
    const pycUser = new PycUser('1', 1, 1, 'foobar', Role.LEADER);
    const offset = 0;
    const limit = 20;

    //when
    //then
    nameSpace.runPromise(async () => {
      await Promise.resolve().then(() => nameSpace.set(PYC_ENTITY_MANAGER, dataSource.createEntityManager()));
      const result = await groupService.findAll(pycUser, offset, limit);
      expect(result).toStrictEqual(new GroupListResponse([], 0));
    });
  });

  it('findAll Test - with offset', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, getMockUsers(churchA));
    await dataSource.manager.save(Group, [
      Group.of(churchA, leaderA, 'groupA', leaderA.id),
      Group.of(churchA, leaderB, 'groupB', leaderB.id),
    ]);
    const pycUser = new PycUser('1', churchA.id, 1, 'foobar', Role.LEADER);
    const offset = 0;
    const limit = 1;

    //when
    //then
    await nameSpace.runPromise(async () => {
      await Promise.resolve().then(() => nameSpace.set(PYC_ENTITY_MANAGER, dataSource.createEntityManager()));
      const result = await groupService.findAll(pycUser, offset, limit);

      const [groupA] = result.rows;
      expect(groupA.name).toBe('groupA');
      expect(result.count).toBe(2);
    });
  });

  it('findAll Test - with limit', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, getMockUsers(churchA));
    await dataSource.manager.save(Group, [
      Group.of(churchA, leaderA, 'groupA', leaderA.id),
      Group.of(churchA, leaderB, 'groupB', leaderB.id),
    ]);
    const pycUser = new PycUser('1', churchA.id, 1, 'foobar', Role.LEADER);
    const offset = 1;
    const limit = 20;

    //when
    //then
    await nameSpace.runPromise(async () => {
      await Promise.resolve().then(() => nameSpace.set(PYC_ENTITY_MANAGER, dataSource.createEntityManager()));
      const result = await groupService.findAll(pycUser, offset, limit);

      const [groupB] = result.rows;
      expect(groupB.name).toBe('groupB');
      expect(result.count).toBe(2);
    });
  });

  it('findById - 존재하지 않는 경우', async () => {
    //given
    const id = 1;

    //when
    //then
    await expect(
      nameSpace.runPromise(async () => {
        await Promise.resolve().then(() => nameSpace.set(PYC_ENTITY_MANAGER, dataSource.createEntityManager()));
        await groupService.findById(id);
      }),
    ).rejects.toThrowError(new NotFoundException('그룹을 찾을 수 없습니다.'));
  });

  it('findById Test', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, getMockUsers(churchA));
    await dataSource.manager.save(Group, [Group.of(churchA, leaderA, 'groupA', leaderA.id)]);

    //when
    //then
    await nameSpace.runPromise(async () => {
      await Promise.resolve().then(() => nameSpace.set(PYC_ENTITY_MANAGER, dataSource.createEntityManager()));
      const result = await groupService.findById(1);

      expect(result.id).toBe(1);
      expect(result.churchId).toBe(1);
      expect(result.name).toBe('groupA');
      expect(result.leader).toStrictEqual(new UserResponse(leaderA));
    });
  });
});
