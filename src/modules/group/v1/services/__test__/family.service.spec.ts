import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { ValidateResponse } from 'src/dto/common/responses/validate.response';
import { CreateFamilyRequest } from 'src/dto/family/requests/create-family.request';
import { UpdateFamilyRequest } from 'src/dto/family/requests/update-family.request';
import { FamilyListResponse } from 'src/dto/family/responses/group-list.response';
import { UserResponse } from 'src/dto/user/responses/user.response';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { Family } from 'src/entities/group/group.entity';
import { User } from 'src/entities/user/user.entity';
import { Gender } from 'src/types/gender/gender.type';
import { Rank } from 'src/types/rank/rank.type';
import { Role } from 'src/types/role/role.type';
import { getMockCell } from 'src/utils/mocks/cell/mock';
import { mockChurchs } from 'src/utils/mocks/churches/mock';
import { getMockFamily } from 'src/utils/mocks/families/mock';
import { getMockUser } from 'src/utils/mocks/users/mock';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityNotFoundError, In } from 'typeorm';
import { IFamilyService } from '../../interfaces/group-service.interface';
import { FamilyService } from '../group.service';

describe('Family Service Test', () => {
  jest.setTimeout(300_000);
  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let service: IFamilyService;

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
          entities: [Church, User, Cell, Family],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Church, User, Cell, Family]),
      ],
      providers: [FamilyService],
    }).compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    service = moduleRef.get<IFamilyService>(FamilyService);
  });

  afterEach(async () => {
    //연관관계에 묶여있기 때문에 CASCADE를 해줘야한다.
    await dataSource.query('DROP TABLE IF EXISTS churches CASCADE');
    await dataSource.query('DROP TABLE IF EXISTS families CASCADE');
    await dataSource.query('DROP TABLE IF EXISTS cells CASCADE');
    await dataSource.query('DROP TABLE IF EXISTS users');
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(container).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(service).toBeDefined();
  });

  it('Save Test - church가 없는 경우', async () => {
    //given
    const req = plainToInstance(CreateFamilyRequest, {
      churchId: 1,
      name: 'Test Family',
      leaderId: null,
      subLeaderId: null,
    });

    //when
    //then
    await expect(service.save(req)).rejects.toThrowError(new EntityNotFoundError(Church, { id: 1 }));
  });

  it('Save Test - leader가 없는 경우', async () => {
    //given
    await dataSource.manager.save(Church, mockChurchs);

    const req = plainToInstance(CreateFamilyRequest, {
      churchId: 1,
      name: 'Test Family',
      leaderId: 1,
      subLeaderId: null,
    });

    //when
    //then
    await expect(service.save(req)).rejects.toThrowError(new EntityNotFoundError(User, { churchId: 1, id: 1 }));
  });

  it('Save Test - leader의 Role이 부적합한 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const leader = await dataSource.manager.save(
      User,
      getMockUser('userA', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    );

    const req = plainToInstance(CreateFamilyRequest, {
      churchId: churchA.id,
      name: 'Test Family',
      leaderId: leader.id,
      subLeaderId: null,
    });

    //when
    //then
    await expect(service.save(req)).rejects.toThrowError(
      new BadRequestException('새신자 또는 셀원은 팸장, 부팸장이 될 수 없습니다.'),
    );
  });

  it('Save Test - subLeader가 없는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const leader = await dataSource.manager.save(
      User,
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    );

    const req = plainToInstance(CreateFamilyRequest, {
      churchId: churchA.id,
      name: 'Test Family',
      leaderId: leader.id,
      subLeaderId: 2,
    });

    //when
    //then
    await expect(service.save(req)).rejects.toThrowError(new EntityNotFoundError(User, { churchId: 1, id: 2 }));
  });

  it('Save Test - sub leader의 Role이 부적합한 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);

    const req = plainToInstance(CreateFamilyRequest, {
      churchId: churchA.id,
      name: 'Test Family',
      leaderId: leaderA.id,
      subLeaderId: leaderB.id,
    });

    //when
    //then
    await expect(service.save(req)).rejects.toThrowError(
      new BadRequestException('새신자 또는 셀원은 팸장, 부팸장이 될 수 없습니다.'),
    );
  });

  it('Save Test - 팸이 정상적으로 생성되고 해당 leader의 Cell의 팸이 Update 될 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const cellA = await dataSource.manager.save(Cell, getMockCell('cellA', leaderA, null));

    const req = plainToInstance(CreateFamilyRequest, {
      churchId: churchA.id,
      name: 'Test Family',
      leaderId: leaderA.id,
      subLeaderId: leaderB.id,
    });

    //when
    const result = await service.save(req);

    //then
    expect(result.id).toBe(1);
    expect(result.name).toBe('Test Family');
    leaderA.changeRole(Role.FAMILY_LEADER);
    expect(result.leader).toStrictEqual(new UserResponse(leaderA));
    leaderB.changeRole(Role.SUB_FAMILY_LEADER);
    expect(result.subLeader).toStrictEqual(new UserResponse(leaderB));

    const cell = await dataSource.manager.findOneByOrFail(Cell, { id: cellA.id });
    expect(cell.familyId).toBe(1);
  });

  it('Save Test - 팸이 정상적으로 생성되고 해당 subLedaer의 Cell의 팸이 Update 될 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [cellA, cellB] = await dataSource.manager.save(Cell, [
      getMockCell('cellA', leaderA, null),
      getMockCell('cellB', leaderB, null),
    ]);

    const req = plainToInstance(CreateFamilyRequest, {
      churchId: churchA.id,
      name: 'Test Family',
      leaderId: leaderA.id,
      subLeaderId: leaderB.id,
    });

    //when
    const result = await service.save(req);

    //then
    expect(result.id).toBe(1);
    expect(result.name).toBe('Test Family');
    leaderA.changeRole(Role.FAMILY_LEADER);
    expect(result.leader).toStrictEqual(new UserResponse(leaderA));
    leaderB.changeRole(Role.SUB_FAMILY_LEADER);
    expect(result.subLeader).toStrictEqual(new UserResponse(leaderB));

    const selectedCellA = await dataSource.manager.findOneByOrFail(Cell, { id: cellA.id });
    expect(selectedCellA.familyId).toBe(1);

    const selectedCellB = await dataSource.manager.findOneByOrFail(Cell, { id: cellB.id });
    expect(selectedCellB.familyId).toBe(1);
  });

  it('Find All Test - 검색 결과가 없을 경우', async () => {
    //given
    const churchId = 1;
    const offset = 0;
    const limit = 10;

    //when
    const result = await service.findAll(churchId, offset, limit);

    //then
    expect(result).toStrictEqual(new FamilyListResponse([], 0));
  });

  it('Find All Test - 검색 결과가 존재할 떄 with Offset', async () => {
    //given
    const offset = 1;
    const limit = 1;

    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, subLeaderA, leaderB, subLeaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);

    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, subLeaderA, 'familyA'));
    const familyB = await dataSource.manager.save(Family, getMockFamily(churchA, leaderB, subLeaderB, 'familyB'));

    //when
    const result = await service.findAll(churchA.id, offset, limit);

    //then
    expect(result).toStrictEqual(new FamilyListResponse([familyB], 2));
  });

  it('Find All Test - 검색 결과가 존재할 떄 with limit', async () => {
    //given
    const offset = 0;
    const limit = 1;

    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, subLeaderA, leaderB, subLeaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);

    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, subLeaderA, 'familyA'));
    const familyB = await dataSource.manager.save(Family, getMockFamily(churchA, leaderB, subLeaderB, 'familyB'));

    //when
    const result = await service.findAll(churchA.id, offset, limit);

    //then
    expect(result).toStrictEqual(new FamilyListResponse([familyA], 2));
  });

  it('FindById Test - 존재하지 않는 경우', async () => {
    //given
    const churchId = 1;
    const id = 1;

    //when
    //then
    await expect(service.findById(churchId, id)).rejects.toThrowError(
      new EntityNotFoundError(Family, {
        where: { churchId, id },
        relations: ['leader', 'subLeader', 'cells'],
      }),
    );
  });

  it('FindById Test - 존재하는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);

    const [cellA, cellB] = await dataSource.manager.save(Cell, [
      getMockCell('cellA', leaderA, null),
      getMockCell('cellB', leaderB, null),
    ]);

    const req = plainToInstance(CreateFamilyRequest, {
      churchId: churchA.id,
      name: 'Test Family',
      leaderId: leaderA.id,
      subLeaderId: leaderB.id,
    });
    const result = await service.save(req);

    //when
    const selectedFamily = await service.findById(churchA.id, result.id);

    //then
    expect(selectedFamily.id).toBe(1);
    expect(selectedFamily.churchId).toBe(1);
    leaderA.changeRole(Role.FAMILY_LEADER);
    expect(selectedFamily.leader).toStrictEqual(new UserResponse(leaderA));
    leaderB.changeRole(Role.SUB_FAMILY_LEADER);
    expect(selectedFamily.subLeader).toStrictEqual(new UserResponse(leaderB));
    expect(selectedFamily.name).toBe('Test Family');
    expect(selectedFamily.cells.length).toBe(2);
  });

  it('Is Exsit Name Test - 존재하지 않는 경우', async () => {
    //given
    const churchId = 1;
    const name = 'Test Family';

    //when
    const result = await service.isUsedName(churchId, name);

    //then
    expect(result).toStrictEqual(new ValidateResponse(false));
  });

  it('Is Exsit Name Test - 존재 하는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const leader = await dataSource.manager.save(
      User,
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    );
    const req = plainToInstance(CreateFamilyRequest, {
      churchId: churchA.id,
      name: 'Test Family',
      leaderId: leader.id,
      subLeaderId: null,
    });
    await service.save(req);

    //when
    const result = await service.isUsedName(churchA.id, 'Test Family');

    //then
    expect(result).toStrictEqual(new ValidateResponse(true));
  });

  it('Update - target이 존재하지 않는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const id = 1;

    const req = plainToInstance(UpdateFamilyRequest, {
      name: 'Test Family',
      leaderId: 1,
      subLeaderId: null,
    });

    //when
    //then
    expect(service.update(churchA.id, id, req)).rejects.toThrowError(
      new EntityNotFoundError(Family, {
        where: { churchId: churchA.id, id },
        relations: ['leader', 'subLeader'],
      }),
    );
  });

  it('Update - target이 존재하고 이름만 변경되는 경우', async () => {
    //given
    const [chuchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const cellA = await dataSource.manager.save(Cell, getMockCell('cellA', leaderA, null));

    await service.save(
      plainToInstance(CreateFamilyRequest, {
        churchId: chuchA.id,
        name: 'Test Family',
        leaderId: leaderA.id,
        subLeaderId: leaderB.id,
      }),
    );

    const req = plainToInstance(UpdateFamilyRequest, {
      name: 'Change Family',
      leaderId: leaderA.id,
      subLeaderId: leaderB.id,
    });

    //when
    const result = await service.update(1, 1, req);

    //then
    expect(result.id).toBe(1);
    expect(result.churchId).toBe(1);
    expect(result.name).toBe('Change Family');
    leaderA.changeRole(Role.FAMILY_LEADER);
    expect(result.leader).toStrictEqual(new UserResponse(leaderA));
    leaderB.changeRole(Role.SUB_FAMILY_LEADER);
    expect(result.subLeader).toStrictEqual(new UserResponse(leaderB));
  });

  it('Update - target이 존재하고 변경되는 leader가 존재하지 않는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const cellA = await dataSource.manager.save(Cell, getMockCell('cellA', leaderA, null));
    await service.save(
      plainToInstance(CreateFamilyRequest, {
        churchId: churchA.id,
        name: 'Test Family',
        leaderId: leaderA.id,
        subLeaderId: leaderB.id,
      }),
    );

    const req = plainToInstance(UpdateFamilyRequest, {
      name: 'Change Family',
      leaderId: 3,
      subLeaderId: 4,
    });

    //when
    await expect(service.update(churchA.id, 1, req)).rejects.toThrowError(
      new EntityNotFoundError(User, { churchId: churchA.id, id: 3 }),
    );
  });

  it('Update - target이 존재하고 변경되는 leader가 존재하지만 권한이 충족치 않을 때', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leader, subLeader, willChangeLeader] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    await dataSource.manager.save(Cell, getMockCell('cellA', leader, null));
    await service.save(
      plainToInstance(CreateFamilyRequest, {
        churchId: churchA.id,
        name: 'Test Family',
        leaderId: leader.id,
        subLeaderId: subLeader.id,
      }),
    );

    const req = plainToInstance(UpdateFamilyRequest, {
      name: 'Change Family',
      leaderId: willChangeLeader.id,
      subLeaderId: 4,
    });

    //when
    await expect(service.update(churchA.id, 1, req)).rejects.toThrowError(
      new BadRequestException('새신자 또는 셀원은 팸장, 부팸장이 될 수 없습니다.'),
    );
  });

  it('Update - target이 존재하고 변경되는 subLeader가 존재하지 않는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leader, subLeader, willChangeLeader] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    await dataSource.manager.save(Cell, getMockCell('cellA', leader, null));
    await service.save(
      plainToInstance(CreateFamilyRequest, {
        churchId: churchA.id,
        name: 'Test Family',
        leaderId: leader.id,
        subLeaderId: subLeader.id,
      }),
    );

    const req = plainToInstance(UpdateFamilyRequest, {
      name: 'Change Family',
      leaderId: willChangeLeader.id,
      subLeaderId: 4,
    });

    //when
    await expect(service.update(churchA.id, 1, req)).rejects.toThrowError(
      new EntityNotFoundError(User, { churchId: churchA.id, id: 4 }),
    );
  });

  it('Update - target이 존재하고 변경되는 subLeader가 존재하지만 권한이 충족치 않을 때', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leader, subLeader, willChangeLeader, willChangeSubLeader] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    await dataSource.manager.save(Cell, getMockCell('cellA', leader, null));
    await service.save(
      plainToInstance(CreateFamilyRequest, {
        churchId: churchA.id,
        name: 'Test Family',
        leaderId: leader.id,
        subLeaderId: subLeader.id,
      }),
    );

    const req = plainToInstance(UpdateFamilyRequest, {
      name: 'Change Family',
      leaderId: willChangeLeader.id,
      subLeaderId: willChangeSubLeader.id,
    });

    //when
    await expect(service.update(churchA.id, 1, req)).rejects.toThrowError(
      new BadRequestException('새신자 또는 셀원은 팸장, 부팸장이 될 수 없습니다.'),
    );
  });

  it('Update - 정상적으로 update가 되며 prev 리더 둘 다 셀리더인 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leader, subLeader, willChangeLeader, willChangeSubLeader] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    await dataSource.manager.save(Cell, [
      getMockCell('cellA', leader, null),
      getMockCell('cellB', subLeader, null),
      getMockCell('cellC', willChangeLeader, null),
      getMockCell('cellD', willChangeSubLeader, null),
    ]);
    await service.save(
      plainToInstance(CreateFamilyRequest, {
        churchId: churchA.id,
        name: 'Test Family',
        leaderId: leader.id,
        subLeaderId: subLeader.id,
      }),
    );

    //when
    const result = await service.update(
      churchA.id,
      1,
      plainToInstance(UpdateFamilyRequest, {
        name: 'Change Family',
        leaderId: willChangeLeader.id,
        subLeaderId: willChangeSubLeader.id,
      }),
    );

    //then
    expect(result.id).toBe(1);
    expect(result.name).toBe('Change Family');
    expect(result.leader.id).toBe(3);
    expect(result.subLeader?.id).toBe(4);

    const [cellC, cellD] = await dataSource.manager.findBy(Cell, { churchId: churchA.id });
    expect(cellC.familyId).toBe(1);
    expect(cellD.familyId).toBe(1);

    const [prevLeader, prevSubLeader] = await dataSource.manager.findBy(User, {
      churchId: churchA.id,
      id: In([leader.id, subLeader.id]),
    });
    expect(prevLeader.role).toStrictEqual(Role.LEADER);
    expect(prevSubLeader.role).toStrictEqual(Role.LEADER);
  });

  it('Update - 정상적으로 update가 되며 prev 리더 둘 다 셀리더가 아닌 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leader, subLeader, willChangeLeader, willChangeSubLeader] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    await dataSource.manager.save(Cell, [
      getMockCell('cellC', willChangeLeader, null),
      getMockCell('cellD', willChangeSubLeader, null),
    ]);
    await service.save(
      plainToInstance(CreateFamilyRequest, {
        churchId: churchA.id,
        name: 'Test Family',
        leaderId: leader.id,
        subLeaderId: subLeader.id,
      }),
    );

    //when
    const result = await service.update(
      churchA.id,
      1,
      plainToInstance(UpdateFamilyRequest, {
        name: 'Change Family',
        leaderId: willChangeLeader.id,
        subLeaderId: willChangeSubLeader.id,
      }),
    );

    //then
    expect(result.id).toBe(1);
    expect(result.name).toBe('Change Family');
    expect(result.leader.id).toBe(3);
    expect(result.subLeader?.id).toBe(4);

    const [cellC, cellD] = await dataSource.manager.findBy(Cell, { churchId: churchA.id });
    expect(cellC.familyId).toBe(1);
    expect(cellD.familyId).toBe(1);

    const [prevLeader, prevSubLeader] = await dataSource.manager.findBy(User, {
      churchId: churchA.id,
      id: In([leader.id, subLeader.id]),
    });
    expect(prevLeader.role).toStrictEqual(Role.MEMBER);
    expect(prevSubLeader.role).toStrictEqual(Role.MEMBER);
  });

  it('DeleteById Test - target이 존재하지 않는 경우', async () => {
    //given
    const churchId = 1;
    const id = 1;

    //when
    //then
    await expect(service.deleteById(churchId, id)).rejects.toThrowError(
      new EntityNotFoundError(Family, {
        where: { churchId, id },
        relations: ['leader', 'subLeader', 'cells'],
      }),
    );
  });

  it('DeleteById Test - Cell이 존재하는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [cellA, cellB, cellC] = await dataSource.manager.save(Cell, [
      getMockCell('cellA', leaderA, null),
      getMockCell('cellB', leaderB, null),
      getMockCell('cellC', leaderC, null),
    ]);
    await service.save(
      plainToInstance(CreateFamilyRequest, {
        churchId: churchA.id,
        name: 'Test Family',
        leaderId: leaderA.id,
        subLeaderId: leaderB.id,
      }),
    );
    const family = await dataSource.manager.findOneByOrFail(Family, { churchId: churchA.id, id: 1 });
    cellC.changeFamily(family);
    await dataSource.manager.save(Cell, cellC);

    //when
    //then
    expect(service.deleteById(churchA.id, 1)).rejects.toThrowError(
      new BadRequestException('해당 팸에 소속된 셀이 존재합니다.'),
    );
  });

  it('DeleteById Test - Cell이 존재하지 않고 리더들이 셀리더일 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [cellA, cellB] = await dataSource.manager.save(Cell, [
      getMockCell('cellA', leaderA, null),
      getMockCell('cellB', leaderB, null),
    ]);
    await service.save(
      plainToInstance(CreateFamilyRequest, {
        churchId: churchA.id,
        name: 'Test Family',
        leaderId: leaderA.id,
        subLeaderId: leaderB.id,
      }),
    );

    //when
    await service.deleteById(churchA.id, 1);

    //then
    const [updatedCellA, updatedCellB] = await dataSource.manager.findBy(Cell, { id: In([cellA.id, cellB.id]) });
    expect(updatedCellA.familyId).toBe(null);
    expect(updatedCellB.familyId).toBe(null);

    const [updatedLeaderA, updatedLeaderB] = await dataSource.manager.findBy(User, {
      id: In([leaderA.id, leaderB.id]),
    });
    expect(updatedLeaderA.role).toStrictEqual(Role.LEADER);
    expect(updatedLeaderB.role).toStrictEqual(Role.LEADER);

    await expect(dataSource.manager.findOneBy(Family, { id: 1 })).resolves.toBeNull();
  });

  it('DeleteById Test - Cell이 존재하지 않고 리더들이 셀리더가 아닌 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    await service.save(
      plainToInstance(CreateFamilyRequest, {
        churchId: churchA.id,
        name: 'Test Family',
        leaderId: leaderA.id,
        subLeaderId: leaderB.id,
      }),
    );

    //when
    await service.deleteById(1, 1);

    //then
    const [updatedLeaderA, updatedLeaderB] = await dataSource.manager.findBy(User, {
      id: In([leaderA.id, leaderB.id]),
    });
    expect(updatedLeaderA.role).toStrictEqual(Role.MEMBER);
    expect(updatedLeaderA.cellId).toBeNull();
    expect(updatedLeaderA.password).toBeNull();
    expect(updatedLeaderB.role).toStrictEqual(Role.MEMBER);
    expect(updatedLeaderB.cellId).toBeNull();
    expect(updatedLeaderB.password).toBeNull();

    await expect(dataSource.manager.findOneBy(Family, { id: 1 })).resolves.toBeNull();
  });
});
