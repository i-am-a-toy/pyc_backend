import { InternalServerErrorException } from '@nestjs/common';
import { createNamespace } from 'cls-hooked';
import { DataSource, EntityManager } from 'typeorm';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from '../database/typeorm/transaction.middleware';
import { Transactional } from './transactional.decorator';

class Greeting {
  @Transactional()
  greeting() {
    console.log('Hello Transactional Decorator');
  }
}

describe('Transactional Decorator Test', () => {
  it('NameSpace가 없이 실행되는 경우', async () => {
    //given
    const mock = new Greeting();

    //when
    //then
    await expect(mock.greeting()).rejects.toThrowError(
      new InternalServerErrorException(`${PYC_NAMESPACE} is not active`),
    );
  });

  it('NameSpace는 있지만 active 되지 않은 경우', async () => {
    //given
    createNamespace(PYC_NAMESPACE);
    const mock = new Greeting();

    //when
    //then
    await expect(mock.greeting()).rejects.toThrowError(
      new InternalServerErrorException(`${PYC_NAMESPACE} is not active`),
    );
  });

  it('entityManager가 없는 경우', async () => {
    //given
    const mock = new Greeting();
    const namespace = createNamespace(PYC_NAMESPACE);

    //when
    //then
    expect(namespace.runPromise(async () => Promise.resolve().then(mock.greeting))).rejects.toThrowError(
      new InternalServerErrorException(`Could not find EntityManager in ${PYC_NAMESPACE} nameSpace`),
    );
  });

  it('entityManager가 있는 경우 (정상)', async () => {
    //given
    const mock = new Greeting();
    const namespace = createNamespace(PYC_NAMESPACE);
    const entityManager = new EntityManager(
      new DataSource({ type: 'sqlite', database: ':memory:', synchronize: true, logging: true }),
    );
    await entityManager.transaction(async (tx) => await tx.query('SELECT 1 + 1'));

    // await namespace.runPromise(async () =>
    //   Promise.resolve()
    //     .then(() => {
    //       namespace.set<EntityManager>(PYC_ENTITY_MANAGER, entityManager);
    //     })
    //     .then(mock.greeting),
    // );
  });
});
