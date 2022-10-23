import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Church } from 'src/entities/church/church.entity';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityNotFoundError, Repository } from 'typeorm';
import { IChurchService } from '../../interfaces/church-service.interface';
import { ChurchService } from '../church.service';
import { mockChurchs, mockCreateChurchRequest, mockUpdateChurchRequest } from 'src/utils/mocks/churches/mock';

describe('ChurchService Test', () => {
  // for docker container (test container)
  jest.setTimeout(300_000);
  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let repository: Repository<Church>;
  let service: IChurchService;

  beforeAll(async () => {
    //create test container
    container = await new PostgreSqlContainer('postgres:latest').withExposedPorts(5432).start();

    //create test module
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: container.getHost(),
          port: container.getPort(),
          database: container.getDatabase(),
          username: container.getUsername(),
          password: container.getPassword(),
          entities: [Church],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Church]),
      ],
      providers: [ChurchService],
    }).compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    repository = dataSource.getRepository<Church>(Church);
    service = moduleRef.get<IChurchService>(ChurchService);
  });

  afterEach(async () => {
    //sequence init
    await repository.query('ALTER SEQUENCE churches_id_seq restart with 1');
    //truncate table
    await repository.clear();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await container.stop();
  });

  it('should be defined', () => {
    expect(container).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(repository).toBeDefined();
    expect(service).toBeDefined();
  });

  it('ChurchService save Test', async () => {
    //given
    const req = mockCreateChurchRequest;

    //when
    const result = await service.save(req);

    //then
    expect(result.id).toBe(1);
    expect(result.zipCode).toBe('11111');
    expect(result.address).toBe('서울시 구로구');
    expect(result.managerName).toBe('lee');
    expect(result.managerContact).toBe('01011111111');
  });

  it('ChurchService findOneById Test (Not Found)', async () => {
    //given
    const id = 999;

    //when
    //then
    await expect(service.findOneById(id)).rejects.toThrowError(new EntityNotFoundError(Church, { id: 999 }));
  });

  it('ChurchService findOneById Test', async () => {
    //given
    await repository.save(mockChurchs);

    //when
    const result = await service.findOneById(1);

    //then
    expect(result.id).toBe(1);
    expect(result.zipCode).toBe('11111');
    expect(result.address).toBe('서울시 구로구');
    expect(result.managerName).toBe('lee');
    expect(result.managerContact).toBe('01011111111');
  });

  it('ChurchService findAll (Not exist Data)', async () => {
    //given
    const offset = 0;
    const limit = 20;

    //when
    const result = await service.findAll(offset, limit);

    //then
    expect(result.rows).toStrictEqual([]);
    expect(result.count).toBe(0);
  });

  it('ChurchService findAll with offset', async () => {
    //given
    const offset = 2;
    const limit = 20;
    await repository.save(mockChurchs);

    //when
    const result = await service.findAll(offset, limit);
    const [churchC, churchD, churchE, churchF] = result.rows;

    //then
    expect(churchC.id).toBe(3);
    expect(churchF.id).toBe(6);
    expect(result.rows.length).toBe(4);
    expect(result.count).toBe(6);
  });

  it('ChurchService findAll with limit', async () => {
    //given
    const offset = 0;
    const limit = 4;
    await repository.save(mockChurchs);

    //when
    const result = await service.findAll(offset, limit);
    const [churchA, churchB, churchC, churchD] = result.rows;

    //then
    expect(churchA.id).toBe(1);
    expect(churchD.id).toBe(4);
    expect(result.rows.length).toBe(4);
    expect(result.count).toBe(6);
  });

  it('ChurchService update (Not Exist Target)', async () => {
    //given
    const targetId = 999;
    const req = mockUpdateChurchRequest;

    //when
    //then
    await expect(service.update(targetId, req)).resolves.not.toThrowError();
  });

  it('ChurchService update', async () => {
    //given
    const targetId = 1;
    const req = mockUpdateChurchRequest;
    await repository.save(mockChurchs);

    //when
    await expect(service.update(targetId, req)).resolves.not.toThrowError();

    //then
    const result = await service.findOneById(targetId);
    expect(result.id).toBe(1);
    expect(result.zipCode).toBe('99999');
    expect(result.address).toBe('서울시 양천구');
    expect(result.managerName).toBe('lim');
    expect(result.managerContact).toBe('01099999999');
  });

  it('ChurchService delete (Not Exist Target)', async () => {
    //given
    const targetId = 1;

    //when
    //then
    await expect(service.delete(targetId)).resolves.not.toThrowError();
  });

  it('ChurchService delete', async () => {
    //given
    const targetId = 1;
    await repository.save(mockChurchs);

    //when
    await expect(service.delete(targetId)).resolves.not.toThrowError();

    //then
    await expect(service.findOneById(targetId)).rejects.toThrowError(new EntityNotFoundError(Church, { id: 1 }));
  });
});
