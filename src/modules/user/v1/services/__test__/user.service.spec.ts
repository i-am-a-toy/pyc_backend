import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { ValidateResponse } from 'src/dto/common/responses/validate.response';
import { CreateUserRequest } from 'src/dto/user/requests/create-user.request';
import { UpdateUserRequest } from 'src/dto/user/requests/update-user.request';
import { UserListResponse } from 'src/dto/user/responses/user-list.response';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { Family } from 'src/entities/group/group.entity';
import { User } from 'src/entities/user/user.entity';
import { LEADER_TYPE } from 'src/enum/leader-type.enum';
import { Gender } from 'src/types/gender/gender.type';
import { Rank } from 'src/types/rank/rank.type';
import { Role } from 'src/types/role/role.type';
import { getMockCell } from 'src/utils/mocks/cell/mock';
import { mockChurchs } from 'src/utils/mocks/churches/mock';
import { getMockFamily } from 'src/utils/mocks/families/mock';
import { getMockUser } from 'src/utils/mocks/users/mock';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { IUserService } from '../../interfaces/user-service.interface';
import { UserService } from '../user.service';

describe('User Servic Test', () => {
  jest.setTimeout(300_000);
  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let service: IUserService;

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
      providers: [UserService],
    }).compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    service = moduleRef.get<IUserService>(UserService);
  });

  afterEach(async () => {
    //??????????????? ???????????? ????????? CASCADE??? ???????????????.
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

  it('Save Test - church??? ?????? ??????', async () => {
    //given
    const churchId = 1;
    const req = plainToInstance(CreateUserRequest, {});

    //when
    //then
    await expect(service.save(churchId, req)).rejects.toThrowError(new EntityNotFoundError(Church, { id: churchId }));
  });

  it('Save Test - Member??? ????????? ??? Cell??? ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const req = plainToInstance(CreateUserRequest, {
      cellId: 1,
    });

    //when
    //then
    await expect(service.save(churchA.id, req)).rejects.toThrowError(
      new EntityNotFoundError(Cell, { id: 1, churchId: 1 }),
    );
  });

  it('Save Test - Member??? ????????? ??? Cell??? ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const req = plainToInstance(CreateUserRequest, {
      cellId: 1,
    });

    //when
    //then
    await expect(service.save(churchA.id, req)).rejects.toThrowError(
      new EntityNotFoundError(Cell, { id: 1, churchId: 1 }),
    );
  });

  it('Save Test - Member ??????????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderC, familyA)]);
    const req = plainToInstance(CreateUserRequest, {
      cellId: cellA.id,
      name: 'userD',
      age: 1,
      role: '??????',
      rank: null,
      gender: null,
      birth: '1996-11-27',
      zipCode: null,
      address: '????????? ?????????',
      contact: '010-1234-5678',
      isLongAbsenced: false,
    });

    //when
    const result = await service.save(churchA.id, req);

    //then
    const saved = await dataSource.manager.findOneByOrFail(User, { id: result.id });
    expect(saved.id).toBe(4);
    expect(saved.name).toBe('userD');
    expect(saved.role).toStrictEqual(Role.MEMBER);
    expect(saved.rank).toStrictEqual(Rank.NONE);
    expect(saved.gender).toStrictEqual(Gender.NONE);
    expect(saved.address.zipCode).toBe('');
    expect(saved.address.address).toBe('????????? ?????????');
    expect(saved.isLongAbsenced).toBe(false);
  });

  it('Save Test - Newbie ??????????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const req = plainToInstance(CreateUserRequest, {
      cellId: null,
      name: 'userA',
      age: 1,
      role: '?????????',
      rank: null,
      gender: null,
      birth: '1996-11-27',
      zipCode: null,
      address: '????????? ?????????',
      contact: '010-1234-5678',
      isLongAbsenced: false,
    });

    //when
    const result = await service.save(churchA.id, req);

    //then
    const saved = await dataSource.manager.findOneByOrFail(User, { id: result.id });
    expect(saved.id).toBe(1);
    expect(saved.name).toBe('userA');
    expect(saved.role).toStrictEqual(Role.NEWBIE);
    expect(saved.rank).toStrictEqual(Rank.NONE);
    expect(saved.gender).toStrictEqual(Gender.NONE);
    expect(saved.address.zipCode).toBe('');
    expect(saved.address.address).toBe('????????? ?????????');
    expect(saved.isLongAbsenced).toBe(false);
  });

  it('FindOneById Test - ???????????? ?????? ??????', async () => {
    //given
    const churchId = 1;
    const id = 1;

    //when
    //then
    await expect(service.findUserById(churchId, id)).rejects.toThrowError(
      new EntityNotFoundError(User, { churchId: 1, id: 1 }),
    );
  });

  it('FindOneById Test - ???????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderC, familyA)]);
    leaderC.changeCell(cellA);
    await dataSource.manager.save(User, leaderC);

    //when
    const selected = await service.findUserById(churchA.id, leaderC.id);

    //then
    expect(selected.id).toBe(3);
    expect(selected.name).toBe('userC');
    expect(selected.role).toBe('?????????');
    expect(selected.rank).toStrictEqual('????????????');
    expect(selected.gender).toStrictEqual('??????');
    expect(selected.zipCode).toBe('12345');
    expect(selected.address).toBe('????????? ?????????');
    expect(selected.isLongAbsenced).toBe(false);
  });

  it('FindUserByRole Test - ?????? ????????? ?????? ??????', async () => {
    const churchId = 1;
    const role = Role.PASTOR;
    const offset = 0;
    const limit = 20;

    //when
    const result = await service.findUsersByRole(churchId, role, offset, limit);

    //then
    expect(result.rows).toStrictEqual([]);
    expect(result.count).toStrictEqual(0);
  });

  it('FindUserByRole Test - with offset', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD, leaderF] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userF', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const role = Role.LEADER;
    const offset = 1;
    const limit = 2;

    //when
    const result = await service.findUsersByRole(churchA.id, role, offset, limit);

    //then
    const [selectedLeaderD, selectedLeaderF] = result.rows;
    expect(result.rows.length).toStrictEqual(2);
    expect(selectedLeaderD.id).toBe(4);
    expect(selectedLeaderF.id).toBe(5);
    expect(result.count).toBe(3);
  });

  it('FindUserByRole Test - with limit', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD, leaderF] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userF', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const role = Role.LEADER;
    const offset = 0;
    const limit = 2;

    //when
    const result = await service.findUsersByRole(churchA.id, role, offset, limit);

    //then
    const [selectedLeaderC, selectedLeaderD] = result.rows;
    expect(result.rows.length).toStrictEqual(2);
    expect(selectedLeaderC.id).toBe(3);
    expect(selectedLeaderD.id).toBe(4);
    expect(result.count).toBe(3);
  });

  it('FindUserByRank Test - ?????? ????????? ?????? ??????', async () => {
    const churchId = 1;
    const rank = Rank.NONE;
    const offset = 0;
    const limit = 20;

    //when
    const result = await service.findUsersByRank(churchId, rank, offset, limit);

    //then
    expect(result.rows).toStrictEqual([]);
    expect(result.count).toStrictEqual(0);
  });

  it('FindUserByRank Test - with offset', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD, leaderF] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.NONE, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.NONE, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userF', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const rank = Rank.INFANT_BAPTISM;
    const offset = 1;
    const limit = 2;

    //when
    const result = await service.findUsersByRank(churchA.id, rank, offset, limit);

    //then
    const [selectedLeaderD, selectedLeaderF] = result.rows;
    expect(result.rows.length).toStrictEqual(2);
    expect(selectedLeaderD.id).toBe(4);
    expect(selectedLeaderF.id).toBe(5);
    expect(result.count).toBe(3);
  });

  it('FindUserByRank Test - with limit', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD, leaderF] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.NONE, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.NONE, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userF', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const rank = Rank.INFANT_BAPTISM;
    const offset = 0;
    const limit = 2;

    //when
    const result = await service.findUsersByRank(churchA.id, rank, offset, limit);

    //then
    const [selectedLeaderC, selectedLeaderD] = result.rows;
    expect(result.rows.length).toStrictEqual(2);
    expect(selectedLeaderC.id).toBe(3);
    expect(selectedLeaderD.id).toBe(4);
    expect(result.count).toBe(3);
  });

  it('FindUsersWithoutCell Test - ?????? ????????? ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const offset = 0;
    const limit = 20;

    //when
    const result = await service.findUsersWithoutCell(churchA.id, offset, limit);

    //then
    expect(result.rows).toStrictEqual([]);
    expect(result.count).toStrictEqual(0);
  });

  it('FindUsersWithoutCell Test Test - with offset', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD, leaderF] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.NONE, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.NONE, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userF', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const offset = 1;
    const limit = 2;

    //when
    const result = await service.findUsersWithoutCell(churchA.id, offset, limit);

    //then
    const [selectedLeaderB, selectedLeaderC] = result.rows;
    expect(result.count).toStrictEqual(5);
    expect(selectedLeaderB.id).toBe(2);
    expect(selectedLeaderC.id).toBe(3);
  });

  it('FindUserByRank Test - with limit', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD, leaderF] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.NONE, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.NONE, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userF', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const offset = 0;
    const limit = 2;

    //when
    const result = await service.findUsersWithoutCell(churchA.id, offset, limit);

    //then
    const [selectedLeaderA, selectedLeaderB] = result.rows;
    expect(result.count).toStrictEqual(5);
    expect(selectedLeaderA.id).toBe(1);
    expect(selectedLeaderB.id).toBe(2);
  });

  it('IsExistByName Test - ???????????? ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const name = 'userA';

    //when
    const result = await service.resultByName(churchA.id, name);

    //then
    expect(result).toStrictEqual(new ValidateResponse(false));
  });

  it('IsExistByName Test - ???????????? ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD, leaderF] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.NONE, Gender.MALE, null),
    ]);

    //when
    const result = await service.resultByName(churchA.id, leaderA.name);

    //then
    expect(result).toStrictEqual(new ValidateResponse(true));
  });

  it('FindTobeLeader Test - ???????????? ?????? ??? familyId??? ?????? ??????', () => {
    //given
    const churchId = 1;
    const type = LEADER_TYPE.CELL;
    const familyId = null;

    //when
    //then
    expect(service.findUserTobeLeader(churchId, type, familyId)).rejects.toThrowError(
      new BadRequestException('???????????? ?????? ???????????? familyId??? ???????????????.'),
    );
  });

  it('FindTobeLeader Test - ??? ????????? ?????? ??? ????????? ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const type = LEADER_TYPE.FAMILY;
    const familyId = null;

    //when
    const result = await service.findUserTobeLeader(churchA.id, type, familyId);

    //then
    expect(result).toStrictEqual(new UserListResponse([], 0));
  });

  it('FindTobeLeader Test - ??? ????????? ?????? ??? ????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD, leaderE, leaderF] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userE', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userF', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));

    const type = LEADER_TYPE.FAMILY;
    const familyId = null;

    //when
    const result = await service.findUserTobeLeader(churchA.id, type, familyId);

    //then
    const [selectedLeaderC, selectedLeaderD, selectedLeaderE, selectedLeaderF] = result.rows;
    expect(selectedLeaderC.id).toBe(3);
    expect(selectedLeaderD.id).toBe(4);
    expect(selectedLeaderE.id).toBe(5);
    expect(selectedLeaderF.id).toBe(6);
    expect(result.count).toStrictEqual(4);
  });

  it('FindTobeLeader Test - ?????? ???????????? ?????? ??? ???????????? ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const type = LEADER_TYPE.CELL;
    const familyId = 1;

    //when
    const result = await service.findUserTobeLeader(churchA.id, type, familyId);

    //then
    expect(result).toStrictEqual(new UserListResponse([], 0));
  });

  it('FindTobeLeader Test - ?????? ???????????? ?????? ??? ???????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const cellA = await dataSource.manager.save(Cell, getMockCell('cellA', leaderC, familyA));
    const [userD, userE, userF] = await dataSource.manager.save(User, [
      getMockUser('userD', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, cellA),
      getMockUser('userE', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, cellA),
      getMockUser('userF', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, cellA),
    ]);

    const type = LEADER_TYPE.CELL;

    //when
    const result = await service.findUserTobeLeader(churchA.id, type, churchA.id);

    //then
    const [selectedD, selectedE, selectedF] = result.rows;
    expect(selectedD.id).toBe(4);
    expect(selectedE.id).toBe(5);
    expect(selectedF.id).toBe(6);
    expect(result.count).toStrictEqual(3);
  });

  it('UpdateCell Test - target??? ???????????? ?????? ??????', () => {
    //given
    const churchId = 1;
    const prevCellId = 1;
    const targetCellId = 2;
    const targetId = 1;

    //when
    //then
    expect(service.updateCell(churchId, prevCellId, targetCellId, targetId)).rejects.toThrowError(
      new EntityNotFoundError(User, { churchId, cellId: prevCellId, id: targetId }),
    );
  });

  it('UpdateCell Test - target cell??? ???????????? ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const cellA = await dataSource.manager.save(Cell, getMockCell('cellA', leaderC, familyA));
    const [userD, userE, userF] = await dataSource.manager.save(User, [
      getMockUser('userD', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, cellA),
    ]);

    //when
    //then
    expect(service.updateCell(churchA.id, cellA.id, 2, userD.id)).rejects.toThrowError(
      new EntityNotFoundError(Cell, { churchId: 1, id: 2 }),
    );
  });

  it('UpdateCell Test - ??????????????? cell ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const [cellA, cellB] = await dataSource.manager.save(Cell, [
      getMockCell('cellA', leaderC, familyA),
      getMockCell('cellB', leaderD, familyA),
    ]);
    const [userE] = await dataSource.manager.save(User, [
      getMockUser('userE', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, cellA),
    ]);

    //when
    await service.updateCell(churchA.id, cellA.id, cellB.id, userE.id);

    //then
    const result = await dataSource.manager.findOneByOrFail(User, { id: userE.id });
    expect(result.cellId).toBe(2);
  });

  it('UpdateInfo Test - target??? ???????????? ?????? ??????', () => {
    //given
    const churchId = 1;
    const id = 1;
    const req = plainToInstance(UpdateUserRequest, {});

    //when
    //then
    expect(service.updateInfo(churchId, id, req)).rejects.toThrowError(new EntityNotFoundError(User, { churchId, id }));
  });

  it('UpdateInfo Test - ??????????????? Update?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const req = plainToInstance(UpdateUserRequest, {
      age: 999,
      rank: '????????????',
      gender: '??????',
      birth: '9999-99-99',
      zipCode: '99999',
      address: '????????? ?????????',
      contact: '010-9999-9999',
      isLongAbsenced: true,
    });

    //when
    const result = await service.updateInfo(churchA.id, userA.id, req);

    //then
    expect(result.id).toBe(1);
    expect(result.age).toBe(999);
    expect(result.rank).toBe('????????????');
    expect(result.gender).toBe('??????');
    expect(result.birth).toBe('9999-99-99');
    expect(result.zipCode).toBe('99999');
    expect(result.address).toBe('????????? ?????????');
    expect(result.contact).toBe('010-9999-9999');
    expect(result.contact).toBe('010-9999-9999');
  });

  it('DeleteById Test - target??? ???????????? ?????? ??????', () => {
    //given
    const churchId = 1;
    const id = 1;

    //when
    //then
    expect(service.deleteById(churchId, id)).rejects.toThrowError(new EntityNotFoundError(User, { churchId, id }));
  });

  it('DeleteById Test - target??? ????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);

    //when
    //then
    expect(service.deleteById(churchA.id, userA.id)).rejects.toThrowError(
      new BadRequestException('????????? ????????? ??? ????????????.'),
    );
  });

  it('DeleteById Test - target??? ??????????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);

    //when
    await service.deleteById(churchA.id, userA.id);

    //then
    await expect(dataSource.manager.findOneByOrFail(User, { churchId: churchA.id, id: userA.id })).rejects.toThrowError(
      new EntityNotFoundError(User, { churchId: churchA.id, id: userA.id }),
    );
  });
});
