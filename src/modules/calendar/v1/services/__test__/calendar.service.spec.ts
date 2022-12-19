import { plainToInstance } from 'class-transformer';
import { CreateCalendarRequest } from 'src/dto/calendar/requests/create-calendar.request';
import { UpdateCalendarRequest } from 'src/dto/calendar/requests/update-calendar.request';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { Calendar } from 'src/entities/calendar-event/calendar.entity';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { LastModifier } from 'src/entities/embedded/last-modifier.entity';
import { Family } from 'src/entities/family/family.entity';
import { User } from 'src/entities/user/user.entity';
import { Gender } from 'src/types/gender/gender.type';
import { Rank } from 'src/types/rank/rank.type';
import { Role } from 'src/types/role/role.type';
import { getMockCalendars } from 'src/utils/mocks/calendar/mock';
import { mockChurchs } from 'src/utils/mocks/churches/mock';
import { getMockUser } from 'src/utils/mocks/users/mock';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { ICalendarService } from '../../interfaces/calendar-service.interface';
import { CalendarService } from '../calendar.service';

describe('Calendar Service Test', () => {
  jest.setTimeout(300_000);
  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let service: ICalendarService;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:latest').withExposedPorts(5432).start();
  });

  afterAll(async () => {
    await container.stop();
  });

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      host: container.getHost(),
      port: container.getPort(),
      database: container.getDatabase(),
      username: container.getUsername(),
      password: container.getPassword(),
      entities: [Church, Family, Cell, User, Calendar],
      synchronize: true,
    });
    await dataSource.initialize();

    service = new CalendarService(dataSource, dataSource.getRepository(Calendar));
  });

  afterEach(async () => {
    await dataSource.query('DROP TABLE IF EXISTS churches CASCADE;');
    await dataSource.query('DROP TABLE IF EXISTS users CASCADE;');
    await dataSource.query('DROP TABLE IF EXISTS calendars CASCADE;');
    await dataSource.destroy();
  });

  it('Should be defined', async () => {
    expect(container).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(service).toBeDefined();
  });

  it('Save Test - Church가 없는 경우', async () => {
    //given
    const pycUser = new PycUser('contextId', 1, 1, 'leewoooo', Role.LEADER);
    const req = plainToInstance(CreateCalendarRequest, {});

    //when
    //then
    await expect(service.save(pycUser, req)).rejects.toThrowError(new EntityNotFoundError(Church, { id: 1 }));
  });

  it('Save Test - User가 없는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const pycUser = new PycUser('contextId', churchA.id, 1, 'leewoooo', Role.LEADER);
    const req = plainToInstance(CreateCalendarRequest, {});

    //when
    //then
    await expect(service.save(pycUser, req)).rejects.toThrowError(new EntityNotFoundError(User, { id: 1 }));
  });

  it('Save Test - 정상적으로 저장', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);

    const pycUser = new PycUser('contextId', churchA.id, leaderA.id, leaderA.name, leaderA.role);
    const now = new Date();

    const req = plainToInstance(CreateCalendarRequest, {
      title: 'title',
      content: 'content',
      start: now,
      end: now,
      isAllDay: true,
    });
    console.log(req);

    //when
    //then
    await service.save(pycUser, req);
  });

  it('getCalendarsByMonth - 결과가 없는 경우', async () => {
    //given
    const pycUser = new PycUser('contextId', 1, 1, 'leewoooo', Role.LEADER);
    const monthDate = new Date('2022-12-01');

    //when
    const result = await service.getCalendarsByMonth(pycUser, monthDate);

    //then
    expect(result.rows).toStrictEqual([]);
    expect(result.count).toBe(0);
  });

  it('getCalendarByMonth Test - option 없이 조회', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    await dataSource.manager.save(Calendar, getMockCalendars(churchA, leaderA));
    const pycUser = new PycUser('contextId', churchA.id, leaderA.id, leaderA.name, leaderA.role);
    const monthDate = new Date('2022-12-17');

    //when
    const result = await service.getCalendarsByMonth(pycUser, monthDate);

    //then
    expect(result.count).toBe(4);

    const [calendarA, calendarB, calendarC, calendarD] = result.rows;
    expect(calendarA.title).toBe('titleA');
    expect(calendarB.title).toBe('titleB');
    expect(calendarC.title).toBe('titleC');
    expect(calendarD.title).toBe('titleD');
  });

  it('getCalendarByMonth Test - with paging offset', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    await dataSource.manager.save(Calendar, getMockCalendars(churchA, leaderA));
    const pycUser = new PycUser('contextId', churchA.id, leaderA.id, leaderA.name, leaderA.role);
    const monthDate = new Date('2022-12-17');

    //when
    const result = await service.getCalendarsByMonth(pycUser, monthDate, { offset: 2, limit: 20 });

    //then
    expect(result.count).toBe(4);

    const [calendarC, calendarD] = result.rows;
    expect(calendarC.title).toBe('titleC');
    expect(calendarD.title).toBe('titleD');
  });

  it('getCalendarByMonth Test - with paging limit', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    await dataSource.manager.save(Calendar, getMockCalendars(churchA, leaderA));
    const pycUser = new PycUser('contextId', churchA.id, leaderA.id, leaderA.name, leaderA.role);
    const monthDate = new Date('2022-12-17');

    //when
    const result = await service.getCalendarsByMonth(pycUser, monthDate, { offset: 0, limit: 2 });

    //then
    expect(result.count).toBe(4);

    const [calendarA, calendarB] = result.rows;
    expect(calendarA.title).toBe('titleA');
    expect(calendarB.title).toBe('titleB');
  });

  it('Update Test - modifier가 존재하지 않을 경우', async () => {
    //given
    const pycUser = new PycUser('contextId', 1, 1, 'leewoooo', Role.LEADER);
    const targetId = 1;
    const req = plainToInstance(UpdateCalendarRequest, {});

    //when
    //then
    await expect(service.update(pycUser, targetId, req)).rejects.toThrowError(
      new EntityNotFoundError(User, { churchId: 1, id: 1 }),
    );
  });

  it('Update Test - target이 존재하지 않을 경우', async () => {
    //given
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const pycUser = new PycUser('contextId', churchA.id, leaderA.id, leaderA.name, leaderA.role);
    const targetId = 1;
    const req = plainToInstance(UpdateCalendarRequest, {});

    //when
    //then
    await expect(service.update(pycUser, targetId, req)).rejects.toThrowError(
      new EntityNotFoundError(Calendar, { churchId: 1, id: 1 }),
    );
  });

  it('Update Test - 정상적으로 수정', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [calendarA] = await dataSource.manager.save(Calendar, getMockCalendars(churchA, leaderA));
    const pycUser = new PycUser('contextId', churchA.id, leaderB.id, leaderA.name, leaderA.role);
    const targetId = calendarA.id;
    const req = plainToInstance(UpdateCalendarRequest, {
      start: new Date('2023-01-01'),
      end: new Date('2023-01-01'),
      isAllDay: false,
      title: 'change',
      content: 'change',
    });

    //when
    await service.update(pycUser, targetId, req);

    //then
    const updated = await dataSource.manager.findOneByOrFail(Calendar, { churchId: churchA.id, id: calendarA.id });
    const { id, start, end, isAllDay, title, content, lastModifier } = updated;
    expect(id).toBe(1);
    expect(start).toStrictEqual(new Date('2023-01-01'));
    expect(end).toStrictEqual(new Date('2023-01-01'));
    expect(isAllDay).toBe(false);
    expect(title).toBe('change');
    expect(content).toBe('change');
    expect(lastModifier).toStrictEqual(new LastModifier('userB', Role.LEADER));
  });

  it('delete Test - target이 존재하지 않는 경우', async () => {
    //given
    const pycUser = new PycUser('contextId', 1, 1, 'leewoooo', Role.LEADER);
    const targetId = 1;

    //when
    //then
    await expect(service.delete(pycUser, targetId)).resolves.not.toThrowError();
  });

  it('delete Test - 정상적으로 삭제', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [calendarA] = await dataSource.manager.save(Calendar, getMockCalendars(churchA, leaderA));

    const pycUser = new PycUser('contextId', churchA.id, leaderB.id, leaderA.name, leaderA.role);
    const targetId = calendarA.id;

    //when
    await expect(service.delete(pycUser, targetId)).resolves.not.toThrowError();

    //then
    await expect(dataSource.manager.findOneByOrFail(Calendar, { id: calendarA.id })).rejects.toThrowError(
      new EntityNotFoundError(Calendar, { id: 1 }),
    );
  });
});
