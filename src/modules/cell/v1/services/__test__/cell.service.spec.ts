import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateCellRequest } from 'src/dto/cell/requests/create-cell.request';
import { UpdateCellRequest } from 'src/dto/cell/requests/update-cell.request';
import { CellResponse } from 'src/dto/cell/response/cell.response';
import { DetailCellResponse } from 'src/dto/cell/response/detail-cell.response';
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
import { DataSource, EntityNotFoundError } from 'typeorm';
import { ICellService } from '../../interfaces/cell-service.interface';
import { CellService } from '../cell.service';

describe('CellService Test', () => {
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let service: ICellService;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().withExposedPorts(5432).start();
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
      providers: [CellService],
    }).compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    service = moduleRef.get<ICellService>(CellService);
  });

  afterEach(async () => {
    await dataSource.query('DROP TABLE IF EXISTS churches CASCADE');
    await dataSource.query('DROP TABLE IF EXISTS families CASCADE');
    await dataSource.query('DROP TABLE IF EXISTS cells CASCADE');
    await dataSource.query('DROP TABLE IF EXISTS users CASCADE');
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(container).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(service).toBeDefined();
  });

  it('SaveTest - Church가 없는 경우', async () => {
    //given
    const churchId = 1;
    const req = plainToInstance(CreateCellRequest, {
      familyId: 1,
      leaderid: 1,
    });

    //when
    //then
    await expect(service.save(churchId, req)).rejects.toThrowError(new EntityNotFoundError(Church, { id: churchId }));
  });

  it('SaveTest - Family가 없는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const req = plainToInstance(CreateCellRequest, {
      familyId: 1,
      leaderid: 1,
    });

    //when
    //then
    await expect(service.save(churchA.id, req)).rejects.toThrowError(new EntityNotFoundError(Family, { id: 1 }));
  });

  it('SaveTest - Leader가 없는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const req = plainToInstance(CreateCellRequest, {
      familyId: familyA.id,
      leaderId: 3,
    });

    //when
    //then
    await expect(service.save(churchA.id, req)).rejects.toThrowError(new EntityNotFoundError(User, { id: 3 }));
  });

  it('SaveTest - Leader가 존재하지만 권한이 부족한 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.NEWBIE, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const req = plainToInstance(CreateCellRequest, {
      familyId: familyA.id,
      leaderId: leaderC.id,
    });

    //when
    //then
    await expect(service.save(churchA.id, req)).rejects.toThrowError(
      new BadRequestException('새신자는 리더가 될 수 없습니다.'),
    );
  });

  it('SaveTest - 정상적으로 저장 - family Id가 있는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const req = plainToInstance(CreateCellRequest, {
      familyId: familyA.id,
      leaderId: leaderC.id,
    });

    //when
    const result = await service.save(churchA.id, req);

    //then
    expect(result.id).toBe(1);
    expect(result.familyId).toBe(1);
    expect(result.leader.id).toBe(3);
    expect(result.name).toBe('userC셀');

    const updatedLeaderC = await dataSource.manager.findOneByOrFail(User, { id: leaderC.id });
    expect(updatedLeaderC.role).toStrictEqual(Role.LEADER);
    expect(updatedLeaderC.cellId).toStrictEqual(1);
  });

  it('SaveTest - 정상적으로 저장 - family Id가 없는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const req = plainToInstance(CreateCellRequest, {
      leaderId: leaderC.id,
    });

    //when
    const result = await service.save(churchA.id, req);

    //then
    expect(result.id).toBe(1);
    expect(result.familyId).toBeNull();
    expect(result.leader.id).toBe(3);
    expect(result.name).toBe('userC셀');

    const updatedLeaderC = await dataSource.manager.findOneByOrFail(User, { id: leaderC.id });
    expect(updatedLeaderC.role).toStrictEqual(Role.LEADER);
    expect(updatedLeaderC.cellId).toStrictEqual(1);
  });

  it('FindAllByFamilyId Test - 검색 결과가 없는 경우', async () => {
    //given
    const churchId = 1;
    const familyId = 1;
    const offset = 0;
    const limit = 20;

    //when
    const result = await service.findAllByFamilyId(churchId, familyId, offset, limit);

    //then
    expect(result.rows).toStrictEqual([]);
    expect(result.count).toBe(0);
  });

  it('FindAllByFamilyId Test - with offset', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const [cellA, cellB] = await dataSource.manager.save(Cell, [
      getMockCell('cellA', leaderC, familyA),
      getMockCell('cellB', leaderD, familyA),
    ]);

    const offset = 0;
    const limit = 20;

    //when
    const result = await service.findAllByFamilyId(churchA.id, familyA.id, offset, limit);

    //then
    const [selectedCellA] = result.rows;
    expect(selectedCellA).toStrictEqual(new CellResponse(cellA));
    expect(result.count).toBe(2);
  });

  it('FindAllByFamilyId Test - with limit', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const [cellA, cellB] = await dataSource.manager.save(Cell, [
      getMockCell('cellA', leaderC, familyA),
      getMockCell('cellB', leaderD, familyA),
    ]);

    const offset = 1;
    const limit = 20;

    //when
    const result = await service.findAllByFamilyId(churchA.id, familyA.id, offset, limit);

    //then
    const [selectedCellB] = result.rows;

    expect(selectedCellB).toStrictEqual(new CellResponse(cellB));
    expect(result.count).toBe(2);
  });

  it('FindAllByFamilyId Test - 존재하지 않는 경우', async () => {
    //given
    const churchId = 1;
    const id = 1;

    //when
    //then
    await expect(service.findOneById(churchId, id)).rejects.toThrowError(
      new EntityNotFoundError(Cell, { where: { churchId, id }, relations: ['leader', 'members'] }),
    );
  });

  it('FindAllByFamilyId Test - 존재하는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderC, familyA)]);
    const [memberA] = await dataSource.manager.save(User, [
      getMockUser('userF', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, cellA),
    ]);

    //when
    const selected = await service.findOneById(churchA.id, cellA.id);

    //then
    expect(selected.id).toBe(1);
    expect(selected.familyId).toBe(1);
    expect(selected.leader.id).toBe(3);
    expect(selected.members.length).toBe(1);
    expect(selected.members[0].id).toBe(5);
  });

  it('Update Test -  target이 존하 않는 경우', async () => {
    //given
    const churchId = 1;
    const id = 1;
    const req = plainToInstance(UpdateCellRequest, {
      leaderId: 1,
      familyId: 1,
    });

    //when
    //then
    await expect(service.update(churchId, id, req)).rejects.toThrowError(
      new EntityNotFoundError(Cell, { where: { churchId, id }, relations: ['leader'] }),
    );
  });

  //이거랑

  //FIX: 순서에 따라 영향을 받는다
  it('Update Test - 요청이 동일한 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderC, familyA)]);

    const req = plainToInstance(UpdateCellRequest, {
      leaderId: leaderC.id,
      familyId: familyA.id,
    });

    //when
    const result = await service.update(churchA.id, cellA.id, req);

    //then
    expect(result).toStrictEqual(new DetailCellResponse(cellA));
  });

  //이거
  it('Update Test - 변경될 Family가 존재하지 않는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);

    const [leaderA, leaderB, leaderC, leaderD, leaderE] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userE', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [familyA, familyB] = await dataSource.manager.save(Family, [
      getMockFamily(churchA, leaderA, leaderB, 'familyA'),
      getMockFamily(churchA, leaderC, leaderD, 'familyB'),
    ]);
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderE, familyA)]);

    const req = plainToInstance(UpdateCellRequest, {
      familyId: 3,
      leaderId: 6,
    });

    //when
    //then
    await expect(service.update(churchA.id, cellA.id, req)).rejects.toThrowError(
      new EntityNotFoundError(Family, { churchId: 1, id: 3 }),
    );
  });

  it('Update Test - 변경될 leader가 존재하지 않는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD, leaderE] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userE', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [familyA, familyB] = await dataSource.manager.save(Family, [
      getMockFamily(churchA, leaderA, leaderB, 'familyA'),
      getMockFamily(churchA, leaderC, leaderD, 'familyB'),
    ]);
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderE, familyA)]);

    const req = plainToInstance(UpdateCellRequest, {
      familyId: familyB.id,
      leaderId: 6,
    });

    //when
    //then
    await expect(service.update(churchA.id, cellA.id, req)).rejects.toThrowError(
      new EntityNotFoundError(User, { churchId: 1, id: 6 }),
    );
  });

  it('Update Test - 정상적으로 성공', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD, leaderE, leaderF] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userE', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userF', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [familyA, familyB] = await dataSource.manager.save(Family, [
      getMockFamily(churchA, leaderA, leaderB, 'familyA'),
      getMockFamily(churchA, leaderC, leaderD, 'familyB'),
    ]);
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderE, familyA)]);

    const req = plainToInstance(UpdateCellRequest, {
      familyId: familyB.id,
      leaderId: leaderF.id,
    });

    //when
    const result = await service.update(churchA.id, cellA.id, req);

    //then
    expect(result.id).toBe(1);
    expect(result.familyId).toBe(2);
    expect(result.leader.id).toBe(6);

    const updatedLeaderE = await dataSource.manager.findOneByOrFail(User, { id: leaderE.id });
    expect(updatedLeaderE.cellId).toBeNull();
    expect(updatedLeaderE.role).toStrictEqual(Role.MEMBER);

    const updatedFamilyA = await dataSource.manager.findOneOrFail(Family, {
      where: { id: familyA.id },
      relations: ['cells'],
    });
    expect(updatedFamilyA.cells).toStrictEqual([]);
  });

  it('Delete Test - 타겟이 존재하지 않는 경우', async () => {
    //given
    const churchId = 1;
    const id = 1;

    //when
    //then
    await expect(service.delete(churchId, id)).rejects.toThrowError(
      new EntityNotFoundError(Cell, { where: { churchId, id }, relations: ['leader', 'members'] }),
    );
  });

  it('Delete Test - 셀원이 존재하는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD, leaderE, leaderF] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userE', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userF', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [familyA, familyB] = await dataSource.manager.save(Family, [
      getMockFamily(churchA, leaderA, leaderB, 'familyA'),
      getMockFamily(churchA, leaderC, leaderD, 'familyB'),
    ]);
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderE, familyA)]);
    const [memberA] = await dataSource.manager.save(User, [
      getMockUser('userG', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, cellA),
    ]);

    //when
    //then
    await expect(service.delete(churchA.id, cellA.id)).rejects.toThrowError(
      new Error('셀원이 있는 셀은 삭제할 수 없습니다.'),
    );
  });

  it('Delete Test - 정상적으로 삭제되는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC, leaderD, leaderE, leaderF] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userD', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userE', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userF', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [familyA, familyB] = await dataSource.manager.save(Family, [
      getMockFamily(churchA, leaderA, leaderB, 'familyA'),
      getMockFamily(churchA, leaderC, leaderD, 'familyB'),
    ]);
    const cellA = await service.save(
      churchA.id,
      plainToInstance(CreateCellRequest, {
        familyId: familyA.id,
        leaderId: leaderE.id,
      }),
    );

    //when
    await service.delete(churchA.id, cellA.id);

    //then
    const updateLeaderE = await dataSource.manager.findOneByOrFail(User, { churchId: churchA.id, id: leaderE.id });
    expect(updateLeaderE.cellId).toBeNull();

    await expect(dataSource.manager.findOneByOrFail(Cell, { churchId: churchA.id, id: cellA.id })).rejects.toThrowError(
      new EntityNotFoundError(Cell, {
        churchId: 1,
        id: 1,
      }),
    );
  });
});
