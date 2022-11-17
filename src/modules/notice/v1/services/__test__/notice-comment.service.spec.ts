import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateNoticeCommentRequest } from 'src/dto/notice-comment/request/create-notice-comment.request';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { Family } from 'src/entities/family/family.entity';
import { NoticeComment } from 'src/entities/notice-comment/notice-comment.entity';
import { Notice } from 'src/entities/notice/notice.entity';
import { User } from 'src/entities/user/user.entity';
import { Gender } from 'src/types/gender/gender.type';
import { Rank } from 'src/types/rank/rank.type';
import { Role } from 'src/types/role/role.type';
import { mockChurchs } from 'src/utils/mocks/churches/mock';
import { getMockNotice } from 'src/utils/mocks/notice/mock';
import { getNoticeComment } from 'src/utils/mocks/notice_comment/mock';
import { getMockUser } from 'src/utils/mocks/users/mock';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { INoticeCommentService } from '../../interfaces/notice-comment.interface';
import { NoticeCommentSerivce } from '../notice-comment.service';

describe('Notice Comment Service Test', () => {
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let service: INoticeCommentService;

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
          entities: [Church, Notice, Family, Cell, User, NoticeComment],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Church, Notice, Family, Cell, User, NoticeComment]),
      ],
      providers: [NoticeCommentSerivce],
    }).compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    service = moduleRef.get<INoticeCommentService>(NoticeCommentSerivce);
  });

  afterEach(async () => {
    await dataSource.query('DROP TABLE churches CASCADE');
    await dataSource.query('DROP TABLE users CASCADE');
    await dataSource.query('DROP TABLE notices CASCADE');
    await dataSource.query('DROP TABLE notice_comments CASCADE');
    await dataSource.destroy();
  });

  it('Should be Defined', () => {
    expect(container).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(service).toBeDefined();
  });

  it('Save Test - Church가 없는 경우', async () => {
    //given
    const churchId = 1;
    const noticeId = 1;
    const userId = 1;

    const pycUser = new PycUser('tokenId', churchId, userId, 'userA', Role.LEADER);
    const req: CreateNoticeCommentRequest = { comment: 'foobar', parentId: null };

    //when
    await expect(service.save(pycUser, noticeId, req)).rejects.toThrowError(new EntityNotFoundError(Church, { id: 1 }));
  });

  it('Save Test - Notice가 없는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const noticeId = 1;

    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const req: CreateNoticeCommentRequest = { comment: 'foobar', parentId: null };

    //when
    await expect(service.save(pycUser, noticeId, req)).rejects.toThrowError(new EntityNotFoundError(Notice, { id: 1 }));
  });

  it('Save Test - 부모가 없는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [getMockNotice(churchA, 'noticeA', 'noticeA', leaderA)]);
    const parentId = 1;

    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const req: CreateNoticeCommentRequest = { comment: 'foobar', parentId: parentId };

    //when
    await expect(service.save(pycUser, noticeA.id, req)).rejects.toThrowError(
      new EntityNotFoundError(NoticeComment, {
        where: { id: 1 },
        relations: ['children'],
      }),
    );
  });

  it('Save Test - 정상적으로 저장 (부모가 없는 경우)', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [getMockNotice(churchA, 'noticeA', 'noticeA', leaderA)]);

    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const req: CreateNoticeCommentRequest = { comment: 'foobar', parentId: null };

    //when
    await service.save(pycUser, noticeA.id, req);
  });

  it('Save Test - 정상적으로 저장 (부모가 있는 경우)', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [getMockNotice(churchA, 'noticeA', 'noticeA', leaderA)]);
    const [noticeCommentA] = await dataSource.manager.save(NoticeComment, [
      getNoticeComment(churchA, noticeA, 'commentA'),
    ]);

    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);
    const req: CreateNoticeCommentRequest = { comment: 'foobar', parentId: noticeCommentA.id };

    //when
    await service.save(pycUser, noticeA.id, req);
  });

  it('Update Test - Target이 존재하지 않는 경우', async () => {
    //given
    const churchId = 1;
    const userId = 1;
    const targetId = 1;
    const comment = 'not exsit target';
    const pycUser = new PycUser('tokenId', churchId, userId, 'userA', Role.LEADER);

    await expect(service.update(pycUser, targetId, comment)).rejects.toThrowError(
      new EntityNotFoundError(NoticeComment, { churchId: 1, id: 1 }),
    );
  });

  it('Update Test - Target이 존재하여 정상적으로 수정', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [getMockNotice(churchA, 'noticeA', 'noticeA', leaderA)]);
    const [noticeCommentA] = await dataSource.manager.save(NoticeComment, [
      getNoticeComment(churchA, noticeA, 'commentA'),
    ]);

    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);

    //when
    await service.update(pycUser, noticeCommentA.id, 'change');

    //then
    const updated = await dataSource.manager.findOneByOrFail(NoticeComment, { id: noticeCommentA.id });
    expect(updated.comment).toBe('change');
  });

  it('Delete Test - 존재하지 않는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);

    //when
    //then
    await expect(service.delete(pycUser, 1)).resolves.not.toThrowError();
  });

  it('Delete Test - Target이 존재하고 정상적으로 삭제 되는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [leaderA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [getMockNotice(churchA, 'noticeA', 'noticeA', leaderA)]);
    const [noticeCommentA] = await dataSource.manager.save(NoticeComment, [
      getNoticeComment(churchA, noticeA, 'commentA'),
    ]);

    const pycUser = new PycUser('tokenId', churchA.id, leaderA.id, 'userA', Role.LEADER);

    //when
    await service.delete(pycUser, noticeCommentA.id);

    //then
    await expect(dataSource.manager.findOneByOrFail(NoticeComment, { id: noticeCommentA.id })).rejects.toThrowError(
      new EntityNotFoundError(NoticeComment, { id: 1 }),
    );
  });
});
