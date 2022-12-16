import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateNoticeCommentRequest } from 'src/dto/notice-comment/requests/create-notice-comment.request';
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
import { getMockUser } from 'src/utils/mocks/users/mock';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { INoticeCommentSerivce } from '../../interfaces/notice-comment-service.interface';
import { NoticeCommentService } from '../notice-comment.service';

describe('Notice Comment Service Test', () => {
  jest.setTimeout(300_000);
  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let service: INoticeCommentSerivce;

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
          entities: [Church, Family, Cell, User, Notice, NoticeComment],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Church, Family, Cell, User, Notice, NoticeComment]),
      ],
      providers: [NoticeCommentService],
    }).compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    service = moduleRef.get<INoticeCommentSerivce>(NoticeCommentService);
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

  it('Save Comment Test - Church가 존재하지 않는 경우', async () => {
    //given
    const pycUser = new PycUser('tokenId', 1, 1, 'userA', Role.LEADER);
    const noticeId = 1;
    const req = plainToInstance(CreateNoticeCommentRequest, { comment: '댓글입니다.' });

    //when
    //then
    await expect(service.save(pycUser, noticeId, req)).rejects.toThrowError(new EntityNotFoundError(Church, { id: 1 }));
  });

  it('Save Comment Test - Notice가 존재하지 않는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const pycUser = new PycUser('tokenId', churchA.id, 1, 'userA', Role.LEADER);
    const noticeId = 1;
    const req = plainToInstance(CreateNoticeCommentRequest, { comment: '댓글입니다.' });

    //when
    //then
    await expect(service.save(pycUser, noticeId, req)).rejects.toThrowError(
      new EntityNotFoundError(Notice, { churchId: 1, id: 1 }),
    );
  });

  it('Save Comment Test - comment writer가 존재하지 않는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [writerA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [Notice.of(churchA, writerA, 'title', 'content')]);

    const pycUser = new PycUser('tokenId', churchA.id, 2, 'userA', Role.LEADER);
    const noticeId = 1;
    const req = plainToInstance(CreateNoticeCommentRequest, { comment: '댓글입니다.' });

    //when
    //then
    await expect(service.save(pycUser, noticeId, req)).rejects.toThrowError(
      new EntityNotFoundError(User, { churchId: 1, id: 2 }),
    );
  });

  it('Save Comment Test - comment가 정상적으로 저장', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [writerA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [Notice.of(churchA, writerA, 'title', 'content')]);

    const pycUser = new PycUser('tokenId', churchA.id, writerA.id, 'userA', Role.LEADER);
    const noticeId = 1;
    const req = plainToInstance(CreateNoticeCommentRequest, { comment: '댓글입니다.' });

    //when
    //then
    await expect(service.save(pycUser, noticeId, req)).resolves.not.toThrowError();
  });

  it('FindAll Comment Test - 조회 결과가 없는 경우', async () => {
    //given
    const churchId = 1;
    const userId = 1;
    const noticeId = 1;
    const offset = 0;
    const limit = 20;
    const pycUser = new PycUser('tokenId', churchId, userId, 'userA', Role.LEADER);

    //when
    const result = await service.findAll(pycUser, noticeId, offset, limit);

    //then
    const { rows, count } = result;
    expect(rows).toStrictEqual([]);
    expect(count).toBe(0);
  });

  it('FindAll Comment Test - 조회 결과가 있는 경우 with limit', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [writerA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [Notice.of(churchA, writerA, 'title', 'content')]);

    const [commentA, commentB, commentC, commentD] = await dataSource.manager.save(NoticeComment, [
      NoticeComment.of(churchA, noticeA, writerA, 'commentA'),
      NoticeComment.of(churchA, noticeA, writerA, 'commentB'),
      NoticeComment.of(churchA, noticeA, writerA, 'commentC'),
      NoticeComment.of(churchA, noticeA, writerA, 'commentD'),
    ]);

    const pycUser = new PycUser('tokenId', churchA.id, writerA.id, 'userA', Role.LEADER);

    //when
    const result = await service.findAll(pycUser, noticeA.id, 0, 2);
    const { rows, count } = result;

    //then
    const [selectedA, selectedB] = rows;

    expect(count).toBe(4);
    expect(selectedA.comment).toBe('commentA');
    expect(selectedB.comment).toBe('commentB');
  });

  it('FindAll Comment Test - 조회 결과가 있는 경우 with Offset', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [writerA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [Notice.of(churchA, writerA, 'title', 'content')]);

    const [commentA, commentB, commentC, commentD] = await dataSource.manager.save(NoticeComment, [
      NoticeComment.of(churchA, noticeA, writerA, 'commentA'),
      NoticeComment.of(churchA, noticeA, writerA, 'commentB'),
      NoticeComment.of(churchA, noticeA, writerA, 'commentC'),
      NoticeComment.of(churchA, noticeA, writerA, 'commentD'),
    ]);

    const pycUser = new PycUser('tokenId', churchA.id, writerA.id, 'userA', Role.LEADER);

    //when
    const result = await service.findAll(pycUser, noticeA.id, 2, 20);
    const { rows, count } = result;

    //then
    const [selectedC, selectedD] = rows;

    expect(count).toBe(4);
    expect(selectedC.comment).toBe('commentC');
    expect(selectedD.comment).toBe('commentD');
  });

  it('FindAll Comment Test - 조회 결과가 있는 경우 with 삭제된 User', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [writerA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [Notice.of(churchA, writerA, 'title', 'content')]);

    const [commentA, commentB] = await dataSource.manager.save(NoticeComment, [
      NoticeComment.of(churchA, noticeA, writerA, 'commentA'),
      NoticeComment.of(churchA, noticeA, writerA, 'commentB'),
    ]);
    await dataSource.manager.remove(writerA);

    const pycUser = new PycUser('tokenId', churchA.id, writerA.id, 'userA', Role.LEADER);

    //when
    const result = await service.findAll(pycUser, noticeA.id, 0, 20);
    const { rows, count } = result;
    //then
    const [selectedA, selectedB] = rows;

    expect(count).toBe(2);
    expect(selectedA.creator.image).toBeNull();
    expect(selectedB.creator.image).toBeNull();
  });

  it('Update Test - target이 존재하지 않는 경우', async () => {
    //given
    const churchId = 1;
    const userId = 1;
    const commentId = 1;
    const comment = 'comment';
    const pycUser = new PycUser('tokenId', churchId, userId, 'userA', Role.LEADER);

    //when
    //then
    await expect(service.update(pycUser, commentId, comment)).rejects.toThrowError(
      new EntityNotFoundError(NoticeComment, { churchId: 1, id: 1 }),
    );
  });

  it('Update Test - modifier가 존재하지 않는 경우', async () => {
    //given
    const modifierId = 2;
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [writerA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [Notice.of(churchA, writerA, 'title', 'content')]);

    const [commentA] = await dataSource.manager.save(NoticeComment, [
      NoticeComment.of(churchA, noticeA, writerA, 'commentA'),
    ]);

    const pycUser = new PycUser('tokenId', churchA.id, modifierId, 'userA', Role.LEADER);

    //when
    //then
    await expect(service.update(pycUser, commentA.id, 'change')).rejects.toThrowError(
      new EntityNotFoundError(User, { churchId: 1, id: 2 }),
    );
  });

  it('Update Test - 작성자와 수정자가 다른 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [writerA, writerB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [Notice.of(churchA, writerA, 'title', 'content')]);

    const [commentA] = await dataSource.manager.save(NoticeComment, [
      NoticeComment.of(churchA, noticeA, writerB, 'commentA'),
    ]);

    const pycUser = new PycUser('tokenId', churchA.id, writerA.id, 'userA', Role.LEADER);

    //when
    //then
    await expect(service.update(pycUser, commentA.id, 'change')).rejects.toThrowError(
      new ForbiddenException('작성자만 수정 할 수 있습니다.'),
    );
  });

  it('Update Test - 정상 수정 완료', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [writerA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [Notice.of(churchA, writerA, 'title', 'content')]);

    const [commentA] = await dataSource.manager.save(NoticeComment, [
      NoticeComment.of(churchA, noticeA, writerA, 'commentA'),
    ]);
    const pycUser = new PycUser('tokenId', churchA.id, writerA.id, 'userA', Role.LEADER);

    //when
    await service.update(pycUser, commentA.id, 'change');

    //then
    const updated = await dataSource.manager.findOneByOrFail(NoticeComment, { churchId: churchA.id, id: 1 });
    expect(updated.comment).toBe('change');
  });

  it('Delete Test - 타겟이 존재하지 않는 경우', async () => {
    //given
    const churchId = 1;
    const userId = 1;
    const commentId = 1;
    const comment = 'comment';
    const pycUser = new PycUser('tokenId', churchId, userId, 'userA', Role.LEADER);

    //when
    //then
    await expect(service.delete(pycUser, commentId)).rejects.toThrowError(
      new EntityNotFoundError(NoticeComment, { churchId: 1, id: 1 }),
    );
  });

  it('Delete Test - 작성자와 삭제자가 다른 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [writerA, writerB] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
      getMockUser('userB', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [Notice.of(churchA, writerA, 'title', 'content')]);

    const [commentA] = await dataSource.manager.save(NoticeComment, [
      NoticeComment.of(churchA, noticeA, writerB, 'commentA'),
    ]);

    const pycUser = new PycUser('tokenId', churchA.id, writerA.id, 'userA', Role.LEADER);

    //when
    //then
    await expect(service.delete(pycUser, commentA.id)).rejects.toThrowError(
      new ForbiddenException('작성자만 삭제 할 수 있습니다.'),
    );
  });

  it('Delete Test - 정상 삭제', async () => {
    //given
    const [churchA] = await dataSource.manager.save(mockChurchs);
    const [writerA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);
    const [noticeA] = await dataSource.manager.save(Notice, [Notice.of(churchA, writerA, 'title', 'content')]);

    const [commentA] = await dataSource.manager.save(NoticeComment, [
      NoticeComment.of(churchA, noticeA, writerA, 'commentA'),
    ]);

    const pycUser = new PycUser('tokenId', churchA.id, writerA.id, 'userA', Role.LEADER);

    //when
    await service.delete(pycUser, commentA.id);

    //then
    await expect(dataSource.manager.findOneByOrFail(NoticeComment, { id: commentA.id })).rejects.toThrowError(
      new EntityNotFoundError(NoticeComment, { id: 1 }),
    );
  });
});
