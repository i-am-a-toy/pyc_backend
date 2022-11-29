import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateNoticeRequest } from 'src/dto/notice/requests/create-notice.request';
import { UpdateNoticeRequest } from 'src/dto/notice/requests/update-notice.request';
import { NoticeListResponse } from 'src/dto/notice/responses/notice-list.response';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { Creator } from 'src/entities/embedded/creator.entity';
import { LastModifier } from 'src/entities/embedded/last-modifier.entity';
import { Family } from 'src/entities/family/family.entity';
import { Notice } from 'src/entities/notice/notice.entity';
import { User } from 'src/entities/user/user.entity';
import { SortType } from 'src/enum/sort-type.enum';
import { Gender } from 'src/types/gender/gender.type';
import { Rank } from 'src/types/rank/rank.type';
import { Role } from 'src/types/role/role.type';
import { mockChurchs } from 'src/utils/mocks/churches/mock';
import { getMockUser } from 'src/utils/mocks/users/mock';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { INoticeService } from '../../interfaces/notcie-service.interface';
import { NoticeService } from '../notice.service';

describe('Notice Service Test', () => {
  jest.setTimeout(300_000);
  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let service: INoticeService;

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
          entities: [Church, Notice, Family, Cell, User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Church, Notice, Family, Cell, User]),
      ],
      providers: [NoticeService],
    }).compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    service = moduleRef.get<INoticeService>(NoticeService);
  });

  afterEach(async () => {
    await dataSource.query('DROP TABLE churches CASCADE');
    await dataSource.query('DROP TABLE users CASCADE');
    await dataSource.query('DROP TABLE notices CASCADE');
    await dataSource.destroy();
  });

  it('Should be Defined', () => {
    expect(container).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(service).toBeDefined();
  });

  it('SaveTest - church가 존재하지 않는 경우', async () => {
    //given
    const pycUser = new PycUser('tokenId', 1, 1, 'leewoooo', Role.LEADER);
    const req = plainToInstance(CreateNoticeRequest, { title: 'title', content: 'content' });

    //when
    //thne
    await expect(service.save(pycUser, req)).rejects.toThrowError(new EntityNotFoundError(Church, { id: 1 }));
  });

  it('SaveTest - 작성자가 존재하지 않는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const pycUser = new PycUser('tokenId', churchA.id, 1, 'leewoooo', Role.LEADER);
    const req = plainToInstance(CreateNoticeRequest, { title: 'title', content: 'content' });

    //when
    //then
    await expect(service.save(pycUser, req)).rejects.toThrowError(
      new EntityNotFoundError(User, { churchId: 1, id: 1 }),
    );
  });

  it('Save Test - 작성완료', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const req = plainToInstance(CreateNoticeRequest, { title: 'title', content: 'content' });

    //when
    await expect(service.save(pycUser, req)).resolves.not.toThrowError();

    //then
    const result = await dataSource.manager.findOneByOrFail(Notice, { churchId: churchA.id, id: 1 });

    const { id, churchId, title, content, creator, lastModifier, createdBy, lastModifiedBy } = result;
    expect(id).toBe(1);
    expect(churchId).toBe(1);
    expect(title).toBe('title');
    expect(content).toBe('content');
    expect(creator).toStrictEqual(new Creator('userA', Role.LEADER));
    expect(lastModifier).toStrictEqual(new LastModifier('userA', Role.LEADER));
    expect(createdBy).toBe(1);
    expect(lastModifiedBy).toBe(1);
  });

  it('FindOneById Test - 존재하지 않는 경우', async () => {
    //given
    const id = 1;
    const churchId = 1;

    //when
    //then
    await expect(service.findOneById(churchId, id)).rejects.toThrowError(
      new EntityNotFoundError(Notice, { churchId, id }),
    );
  });

  it('FindOneById Test - 존재하는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const req = plainToInstance(CreateNoticeRequest, { title: 'title', content: 'content' });
    await service.save(pycUser, req);

    //when
    const result = await service.findOneById(churchA.id, 1);

    //then
    expect(result.id).toBe(1);
    expect(result.name).toBe('userA');
    expect(result.title).toBe('title');
    expect(result.title).toBe('title');
    expect(result.content).toBe('content');
    expect(result.role).toBe('셀리더');
  });

  it('FindOneById Test - 존재하는 경우 (작성자는 삭제된 경우)', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const req = plainToInstance(CreateNoticeRequest, { title: 'title', content: 'content' });
    await service.save(pycUser, req);
    await dataSource.manager.remove(leaderA);

    //when
    const result = await service.findOneById(churchA.id, 1);

    //then
    expect(result.id).toBe(1);
    expect(result.name).toBe('userA');
    expect(result.title).toBe('title');
    expect(result.title).toBe('title');
    expect(result.content).toBe('content');
    expect(result.role).toBe('셀리더');
  });

  it('FindAll Test - 검색 결과가 없는 경우', async () => {
    //given
    const churchId = 1;
    const limit = 0;
    const offset = 20;

    //when
    const result = await service.findAll(churchId, offset, limit, SortType.DESC);

    //then
    expect(result).toStrictEqual(new NoticeListResponse([], 0));
  });

  it('FindAll Test - 검색 결과가 있는 경우 with offset', async () => {
    //given
    const offset = 1;
    const limit = 1;

    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const req = plainToInstance(CreateNoticeRequest, { title: 'title', content: 'content' });
    await service.save(pycUser, req);
    await service.save(pycUser, req);

    //when
    const { rows, count } = await service.findAll(churchA.id, offset, limit, SortType.DESC);

    //then
    const [selected] = rows;
    expect(selected.id).toBe(1);
    expect(count).toBe(2);
  });

  it('FindAll Test - 검색 결과가 있는 경우 with limit', async () => {
    //given
    const offset = 0;
    const limit = 1;

    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const req = plainToInstance(CreateNoticeRequest, { title: 'title', content: 'content' });
    await service.save(pycUser, req);
    await service.save(pycUser, req);

    //when
    const { rows, count } = await service.findAll(churchA.id, offset, limit, SortType.DESC);

    //then
    const [selected] = rows;
    expect(selected.id).toBe(2);
    expect(count).toBe(2);
  });

  it('FindAll Test - 검색 결과가 있는 경우 with 삭제 된 User', async () => {
    //given
    const offset = 0;
    const limit = 2;

    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const req = plainToInstance(CreateNoticeRequest, { title: 'title', content: 'content' });
    await service.save(pycUser, req);
    await service.save(pycUser, req);
    await dataSource.manager.remove(leaderA);

    //when
    const { rows, count } = await service.findAll(churchA.id, offset, limit, SortType.DESC);

    //then
    const [noticeB, noticeA] = rows;
    expect(noticeB.id).toBe(2);
    expect(noticeA.id).toBe(1);
    expect(count).toBe(2);
  });

  it('FindAll Test - 검색 결과가 있는 경우 with 정렬', async () => {
    //given
    const offset = 0;
    const limit = 2;

    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const req = plainToInstance(CreateNoticeRequest, { title: 'titleA', content: 'contentA' });
    const req2 = plainToInstance(CreateNoticeRequest, { title: 'titleB', content: 'contentB' });
    await service.save(pycUser, req);
    await service.save(pycUser, req2);
    await dataSource.manager.remove(leaderA);

    //when
    const { rows, count } = await service.findAll(churchA.id, offset, limit, SortType.ASC);

    //then
    const [noticeA, noticeB] = rows;
    expect(noticeA.title).toBe('titleA');
    expect(noticeB.title).toBe('titleB');
    expect(count).toBe(2);
  });

  it('Update Test - Target이 존재하지 않는 경우', async () => {
    //given
    const pycUser = new PycUser('tokenId', 1, 1, 'userA', Role.LEADER);
    const targetId = 1;
    const req = plainToInstance(UpdateNoticeRequest, { title: 'title', content: 'content' });

    //when
    //then
    await expect(service.update(pycUser, targetId, req)).rejects.toThrowError(
      new EntityNotFoundError(Notice, { churchId: 1, id: 1 }),
    );
  });

  it('Update Test - writer가 존재하지 않는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const originWriterPycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const updateWriterpycUser = new PycUser('tokenId', churchA.id, 2, 'userB', Role.LEADER);
    const req = plainToInstance(CreateNoticeRequest, { title: 'title', content: 'content' });
    await service.save(originWriterPycUser, req);

    //when
    //then
    await expect(service.update(updateWriterpycUser, 1, req)).rejects.toThrowError(
      new EntityNotFoundError(User, { churchId: 1, id: 2 }),
    );
  });

  it('Update Test - 정상적으로 Update되는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA, leaderB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.SUB_FAMILY_LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const originWriterPycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const updateWriterpycUser = new PycUser('tokenId', churchA.id, leaderB.id, 'userB', Role.SUB_FAMILY_LEADER);
    const req = plainToInstance(CreateNoticeRequest, { title: 'change', content: 'change' });
    await service.save(originWriterPycUser, req);

    //when
    await service.update(updateWriterpycUser, 1, req);

    //then
    const updated = await dataSource.manager.findOneByOrFail(Notice, { id: 1 });
    expect(updated.id).toBe(1);
    expect(updated.title).toBe('change');
    expect(updated.content).toBe('change');
  });

  it('DeleteById - 존재하지 않는 경우', async () => {
    //given
    const churchId = 1;
    const targetId = 1;

    //when
    //then
    await expect(service.deleteById(churchId, targetId)).resolves.not.toThrowError();
  });

  it('DeleteById - 정상적으로 삭제', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const req = plainToInstance(CreateNoticeRequest, { title: 'change', content: 'change' });
    await service.save(pycUser, req);

    //when
    await expect(service.deleteById(churchA.id, 1)).resolves.not.toThrowError();

    //then
    await expect(dataSource.manager.findOneByOrFail(Notice, { churchId: churchA.id, id: 1 })).rejects.toThrowError(
      new EntityNotFoundError(Notice, { churchId: 1, id: 1 }),
    );
  });
});
