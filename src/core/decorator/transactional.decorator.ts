import { InternalServerErrorException } from '@nestjs/common';
import { getNamespace } from 'cls-hooked';
import { EntityManager } from 'typeorm';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from '../database/typeorm/transaction.middleware';

/**
 * Transactional
 *
 * @description
 * target {@link target}는 class의 ProtoType이 정의된다.
 * propertyKey {@link propertyKey}는 method의 이름이 정의된다
 * descriptor {@link descriptor}는 Target이 되는 method의 정보들이 들어있다.
 */
export function Transactional() {
  return function (_target: Object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
    // save original method
    const originMethod = descriptor.value;

    // wrapped origin method with Transaction
    async function transactionWrapped(...args: unknown[]) {
      // validate nameSpace && get nameSpace
      const nameSpace = getNamespace(PYC_NAMESPACE);
      if (!nameSpace || !nameSpace.active) throw new InternalServerErrorException(`${PYC_NAMESPACE} is not active`);

      // get EntityManager
      const em = nameSpace.get(PYC_ENTITY_MANAGER) as EntityManager;
      if (!em) throw new InternalServerErrorException(`Could not find EntityManager in ${PYC_NAMESPACE} nameSpace`);

      return await em.transaction(async (tx: EntityManager) => {
        nameSpace.set<EntityManager>(PYC_ENTITY_MANAGER, tx);
        return await originMethod.apply(this, args);
      });
    }

    descriptor.value = transactionWrapped;
  };
}
