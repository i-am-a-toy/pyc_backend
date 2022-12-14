import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { AttendanceRequest } from 'src/dto/attendance/requests/attendance.request';
import { AttendanceCountResponse } from 'src/dto/attendance/responses/attendance-count.response';
import { Attendance } from 'src/entities/attendnace/attendance.entity';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { Family } from 'src/entities/group/group.entity';
import { User } from 'src/entities/user/user.entity';
import { AttendanceFilter } from 'src/enum/attendance-filter-type.enum';
import { Gender } from 'src/types/gender/gender.type';
import { Rank } from 'src/types/rank/rank.type';
import { Role } from 'src/types/role/role.type';
import { getMockCell } from 'src/utils/mocks/cell/mock';
import { mockChurchs } from 'src/utils/mocks/churches/mock';
import { getMockFamily } from 'src/utils/mocks/families/mock';
import { getMockUser } from 'src/utils/mocks/users/mock';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { AttendanceCountFactoryKey, AttendnaceCountFactory } from '../../factories/attendance-count.factory';
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
        TypeOrmModule.forFeature([Church, Family, Cell, User, Attendance]),
      ],
      providers: [AttendanceService, { provide: AttendanceCountFactoryKey, useClass: AttendnaceCountFactory }],
    }).compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    service = moduleRef.get<IAttendanceService>(AttendanceService);
  });

  afterEach(async () => {
    //??????????????? ???????????? ????????? CASCADE??? ???????????????.
    await dataSource.query('DROP TABLE IF EXISTS churches CASCADE');
    await dataSource.query('DROP TABLE IF EXISTS families CASCADE');
    await dataSource.query('DROP TABLE IF EXISTS cells CASCADE');
    await dataSource.query('DROP TABLE IF EXISTS users CASCADE');
    await dataSource.query('DROP TABLE IF EXISTS attendance CASCADE');
    await dataSource.destroy();
  });

  it('Should be defined', () => {
    expect(container).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(service).toBeDefined();
  });

  it('attend Test - Church??? ???????????? ?????? ???', async () => {
    //given
    const req = plainToInstance(AttendanceRequest, {
      churchId: 1,
      cellId: 1,
      worthshipAttendance: [],
      groupAttendance: [],
      attendanceDate: '2022-10-31',
      attendanceWeekly: 44,
    });

    //when
    //then
    await expect(service.attend(req)).rejects.toThrowError(new EntityNotFoundError(Church, { id: req.churchId }));
  });

  it('attend Test - cell??? ???????????? ?????? ???', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);

    const req = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: 1,
      worthshipAttendance: [],
      groupAttendance: [],
      attendanceDate: '2022-10-31',
      attendanceWeekly: 44,
    });

    //when
    //then
    await expect(service.attend(req)).rejects.toThrowError(new EntityNotFoundError(Cell, { id: req.cellId }));
  });

  it('attend Test - ??????????????? ???????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderC, familyA)]);

    const req = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: cellA.id,
      worthshipAttendance: [1, 2, 3],
      groupAttendance: [4, 5, 6],
      attendanceDate: '2022-10-31',
      attendanceWeekly: 44,
    });

    //when
    //then
    await expect(service.attend(req)).resolves.not.toThrowError();
  });

  it('FindOneByCellAndDate - ???????????? ?????? ??????', async () => {
    //given
    const churchId = 1;
    const cellId = 1;
    const date = new Date('2022-10-31');
    const weekly = 44;

    //when
    //then
    await expect(service.findOneByCellAndDate(churchId, cellId, date, weekly)).rejects.toThrowError(
      new EntityNotFoundError(Attendance, {
        churchId,
        cellId,
        attendanceDate: date,
        attendanceWeekly: weekly,
      }),
    );
  });

  it('FindOneByCellAndDate - ??????????????? ???????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderC, familyA)]);

    const req = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: cellA.id,
      worthshipAttendance: [1, 2, 3],
      groupAttendance: [4, 5, 6],
      attendanceDate: '2022-10-31',
      attendanceWeekly: 44,
    });
    await expect(service.attend(req)).resolves.not.toThrowError();

    //when
    const attendance = await service.findOneByCellAndDate(
      churchA.id,
      cellA.id,
      new Date(req.attendanceDate),
      req.attendanceWeekly,
    );

    //then
    expect(attendance.id).toBe(1);
    expect(attendance.churchId).toBe(1);
    expect(attendance.cellId).toBe(1);
    expect(attendance.worshipAttendance).toStrictEqual([1, 2, 3]);
    expect(attendance.groupAttendance).toStrictEqual([4, 5, 6]);
    expect(attendance.attendanceDate).toStrictEqual(new Date('2022-10-31'));
    expect(attendance.attendanceWeekly).toBe(44);
  });

  it('FindOneByCellAndDate - ????????? ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderC, familyA)]);

    const req = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: cellA.id,
      worthshipAttendance: [],
      groupAttendance: [],
      attendanceDate: '2022-10-31',
      attendanceWeekly: 44,
    });
    await expect(service.attend(req)).resolves.not.toThrowError();

    //when
    const attendance = await service.findOneByCellAndDate(
      churchA.id,
      cellA.id,
      new Date(req.attendanceDate),
      req.attendanceWeekly,
    );

    //then
    expect(attendance.id).toBe(1);
    expect(attendance.churchId).toBe(1);
    expect(attendance.cellId).toBe(1);
    expect(attendance.worshipAttendance).toStrictEqual([]);
    expect(attendance.groupAttendance).toStrictEqual([]);
    expect(attendance.attendanceDate).toStrictEqual(new Date('2022-10-31'));
    expect(attendance.attendanceWeekly).toBe(44);
  });

  it('Get Count Test - Weekly (?????? ????????? ?????? ??????)', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderC, familyA)]);

    const req = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: cellA.id,
      worthshipAttendance: [1, 2, 3],
      groupAttendance: [4, 5],
      attendanceDate: '2022-11-03',
      attendanceWeekly: 44,
    });
    await expect(service.attend(req)).resolves.not.toThrowError();

    //when
    const result = await service.getCount(
      churchA.id,
      AttendanceFilter.WEEK,
      new Date(req.attendanceDate),
      req.attendanceWeekly,
    );

    //then
    expect(result).toStrictEqual(new AttendanceCountResponse(3, 2));
  });

  it('Get Count Test - Weekly (?????? ????????? ?????? ?????? cell??? ?????????)', async () => {
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

    const req = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: cellA.id,
      worthshipAttendance: [1, 2, 3],
      groupAttendance: [4, 5],
      attendanceDate: '2022-11-03',
      attendanceWeekly: 44,
    });
    await expect(service.attend(req)).resolves.not.toThrowError();

    const req2 = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: cellB.id,
      worthshipAttendance: [1, 2],
      groupAttendance: [4, 5, 6],
      attendanceDate: '2022-11-03',
      attendanceWeekly: 44,
    });
    await expect(service.attend(req2)).resolves.not.toThrowError();

    //when
    const result = await service.getCount(
      churchA.id,
      AttendanceFilter.WEEK,
      new Date(req.attendanceDate),
      req.attendanceWeekly,
    );

    //then
    expect(result).toStrictEqual(new AttendanceCountResponse(5, 5));
  });

  it('Get Count Test - Weekly (?????? ????????? ?????? ??????)', async () => {
    //given
    const churchId = 1;
    const filter = AttendanceFilter.WEEK;
    const date = new Date('2022-11-03');
    const weekly = 44;

    //when
    const result = await service.getCount(churchId, filter, date, weekly);

    //then
    expect(result).toStrictEqual(new AttendanceCountResponse(0, 0));
  });

  it('Get Count Test - Month (?????? ????????? ?????? ??????)', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderC, familyA)]);

    const req = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: cellA.id,
      worthshipAttendance: [1, 2, 3],
      groupAttendance: [4, 5],
      attendanceDate: '2022-11-03',
      attendanceWeekly: 44,
    });
    await expect(service.attend(req)).resolves.not.toThrowError();

    //when
    const result = await service.getCount(
      churchA.id,
      AttendanceFilter.MONTH,
      new Date(req.attendanceDate),
      req.attendanceWeekly,
    );

    //then
    expect(result).toStrictEqual(new AttendanceCountResponse(3, 2));
  });

  it('Get Count Test - Month (?????? ????????? ?????? ?????? - ?????? ???)', async () => {
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

    const req = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: cellA.id,
      worthshipAttendance: [1, 2, 3],
      groupAttendance: [4, 5],
      attendanceDate: '2022-11-03',
      attendanceWeekly: 44,
    });
    await expect(service.attend(req)).resolves.not.toThrowError();

    const req2 = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: cellB.id,
      worthshipAttendance: [1, 2],
      groupAttendance: [4, 5, 6],
      attendanceDate: '2022-11-10',
      attendanceWeekly: 45,
    });
    await expect(service.attend(req2)).resolves.not.toThrowError();

    const req3 = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: cellB.id,
      worthshipAttendance: [1, 2],
      groupAttendance: [4, 5, 6],
      attendanceDate: '2022-12-01',
      attendanceWeekly: 48,
    });
    await expect(service.attend(req3)).resolves.not.toThrowError();

    //when
    const result = await service.getCount(
      churchA.id,
      AttendanceFilter.MONTH,
      new Date(req.attendanceDate),
      req.attendanceWeekly,
    );

    //then
    expect(result).toStrictEqual(new AttendanceCountResponse(5, 5));
  });

  it('Get Count Test - Month (?????? ????????? ?????? ??????)', async () => {
    //given
    const churchId = 1;
    const filter = AttendanceFilter.MONTH;
    const date = new Date('2022-11-03');
    const weekly = 44;

    //when
    const result = await service.getCount(churchId, filter, date, weekly);

    //then
    expect(result).toStrictEqual(new AttendanceCountResponse(0, 0));
  });

  it('Get Count Test - YEAR (?????? ????????? ?????? ??????)', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB, leaderC] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userC', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const familyA = await dataSource.manager.save(Family, getMockFamily(churchA, leaderA, leaderB, 'familyA'));
    const [cellA] = await dataSource.manager.save(Cell, [getMockCell('cellA', leaderC, familyA)]);

    const req = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: cellA.id,
      worthshipAttendance: [1, 2, 3],
      groupAttendance: [4, 5],
      attendanceDate: '2022-11-03',
      attendanceWeekly: 44,
    });
    await expect(service.attend(req)).resolves.not.toThrowError();

    //when
    const result = await service.getCount(
      churchA.id,
      AttendanceFilter.YEAR,
      new Date(req.attendanceDate),
      req.attendanceWeekly,
    );

    //then
    expect(result).toStrictEqual(new AttendanceCountResponse(3, 2));
  });

  it('Get Count Test - YEAR (?????? ????????? ?????? ?????? - ?????? ???)', async () => {
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

    const req = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: cellA.id,
      worthshipAttendance: [1, 2, 3],
      groupAttendance: [4, 5],
      attendanceDate: '2022-10-26',
      attendanceWeekly: 43,
    });
    await expect(service.attend(req)).resolves.not.toThrowError();

    const req2 = plainToInstance(AttendanceRequest, {
      churchId: churchA.id,
      cellId: cellB.id,
      worthshipAttendance: [1, 2],
      groupAttendance: [4, 5, 6],
      attendanceDate: '2022-11-10',
      attendanceWeekly: 45,
    });
    await expect(service.attend(req2)).resolves.not.toThrowError();

    //when
    const result = await service.getCount(
      churchA.id,
      AttendanceFilter.YEAR,
      new Date(req.attendanceDate),
      req.attendanceWeekly,
    );

    //then
    expect(result).toStrictEqual(new AttendanceCountResponse(5, 5));
  });

  it('Get Count Test - Month (?????? ????????? ?????? ??????)', async () => {
    //given
    const churchId = 1;
    const filter = AttendanceFilter.MONTH;
    const date = new Date('2022-11-03');
    const weekly = 44;

    //when
    const result = await service.getCount(churchId, filter, date, weekly);

    //then
    expect(result).toStrictEqual(new AttendanceCountResponse(0, 0));
  });

  it('Get Count Test - YEAR (?????? ????????? ?????? ??????)', async () => {
    //given
    const churchId = 1;
    const filter = AttendanceFilter.YEAR;
    const date = new Date('2022-11-03');
    const weekly = 44;

    //when
    const result = await service.getCount(churchId, filter, date, weekly);

    //then
    expect(result).toStrictEqual(new AttendanceCountResponse(0, 0));
  });
});
