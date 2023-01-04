import { InternalServerErrorException } from '@nestjs/common';
import { createNamespace } from 'cls-hooked';
import { BaseTimeEntity } from 'src/entities/base-time.entity';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, Entity, EntityTarget } from 'typeorm';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';
import { TransactionManager } from './transaction.manager';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from './transaction.middleware';

@Entity()
class Mock extends BaseTimeEntity {}

class MockRepository extends GenericTypeOrmRepository<Mock> {
  getName(): EntityTarget<Mock> {
    return Mock.name;
  }
}

describe('GenericTypeOrm Repository', () => {
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let mockRepository: MockRepository;

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
      entities: [Mock],
      logging: true,
    });
    await dataSource.initialize();

    mockRepository = new MockRepository(new TransactionManager());
  });

  afterAll(async () => {
    await dataSource.destroy();
    await container.stop();
  });

  it('Should be defined', () => {
    expect(container).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(mockRepository).toBeDefined();
  });

  it('NameSpace가 존재하지 않는 경우', async () => {
    //given
    const e = new Mock();

    //when
    //then
    await expect(mockRepository.save(e)).rejects.toThrowError(
      new InternalServerErrorException(`${PYC_NAMESPACE} is not active`),
    );
  });

  it('NameSpace가 있지만 active 상태가 아닌 경우', async () => {
    //given
    const e = new Mock();
    createNamespace(PYC_NAMESPACE);

    //when
    //then
    await expect(mockRepository.save(e)).rejects.toThrowError(
      new InternalServerErrorException(`${PYC_NAMESPACE} is not active`),
    );
  });

  it('정상적으로 저장 with Save & findOne', async () => {
    //given
    const e = new Mock();
    const namespace = createNamespace(PYC_NAMESPACE);

    //when
    await namespace.runPromise(async () => {
      //set EntityManager
      await Promise.resolve().then(() => namespace.set(PYC_ENTITY_MANAGER, dataSource.createEntityManager()));

      // save
      await mockRepository.save(e);

      //then
      const result = await mockRepository.findById(1);
      expect(result).not.toBeNull();
    });
  });

  it('정상적으로 삭제 with Save & remove & findOne', async () => {
    //given
    const e = new Mock();
    const namespace = createNamespace(PYC_NAMESPACE);

    //when
    await namespace.runPromise(async () => {
      //set EntityManager
      await Promise.resolve().then(() => namespace.set(PYC_ENTITY_MANAGER, dataSource.createEntityManager()));

      // save
      await mockRepository.save(e);
      const result = await mockRepository.findById(1);

      // remove
      await mockRepository.remove(result!);

      //then
      const notExist = await mockRepository.findById(1);
      expect(notExist).toBeNull();
    });
  });
});
