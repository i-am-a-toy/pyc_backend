import { InternalServerErrorException } from '@nestjs/common';
import { createNamespace } from 'cls-hooked';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionManager } from './transaction.manager';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from './transaction.middleware';

describe('TransactionManager Test', () => {
  it('NameSpace가 없는 경우', () => {
    //given
    const manager = new TransactionManager();

    //when
    //then
    expect(() => manager.getEntityManager()).toThrowError(
      new InternalServerErrorException(`${PYC_NAMESPACE} is not active`),
    );
  });

  it('NameSpace가 있지만 Active가 아닌 경우', () => {
    //given
    const manager = new TransactionManager();
    createNamespace(PYC_NAMESPACE);

    //when
    //then
    expect(() => manager.getEntityManager()).toThrowError(
      new InternalServerErrorException(`${PYC_NAMESPACE} is not active`),
    );
  });

  it('정상 작동', async () => {
    //given
    const manager = new TransactionManager();
    const namespace = createNamespace(PYC_NAMESPACE);

    //when
    const dataSource = await new DataSource({
      type: 'sqlite',
      database: ':memory:',
      logging: true,
    }).initialize();
    const em = dataSource.createEntityManager();

    namespace.runPromise(async () =>
      Promise.resolve()
        .then(() => {
          namespace.set<EntityManager>(PYC_ENTITY_MANAGER, em);
        })
        .then(() => {
          const got = manager.getEntityManager();
          //then
          expect(got).toStrictEqual(em);
        }),
    );
  });
});
