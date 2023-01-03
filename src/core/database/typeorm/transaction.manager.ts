import { InternalServerErrorException } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { getNamespace } from 'cls-hooked';
import { EntityManager } from 'typeorm';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from './transaction.middleware';

@Injectable()
export class TransactionManager {
  getEntityManager(): EntityManager {
    const nameSpace = getNamespace(PYC_NAMESPACE);
    if (!nameSpace || !nameSpace.active) throw new InternalServerErrorException(`${PYC_NAMESPACE} is not active`);
    return nameSpace.get(PYC_ENTITY_MANAGER);
  }
}
