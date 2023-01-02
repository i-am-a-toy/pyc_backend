import { Injectable, Logger } from '@nestjs/common';
import { NestMiddleware } from '@nestjs/common/interfaces';
import { createNamespace, getNamespace } from 'cls-hooked';
import { NextFunction, Request, Response } from 'express';
import { EntityManager } from 'typeorm';

export const PYC_NAMESPACE = 'namespace/pyc';
export const PYC_ENTITY_MANAGER = 'namespace/entity-manager';

@Injectable()
export class TransactionMiddleware implements NestMiddleware {
  private readonly logger: Logger = new Logger(TransactionMiddleware.name);
  constructor(private readonly em: EntityManager) {}

  use(_req: Request, _res: Response, next: NextFunction): void {
    const namespace = getNamespace(PYC_NAMESPACE) ?? createNamespace(PYC_NAMESPACE);
    this.logger.log(`Hit TransactionMiddleware`);
    namespace.run(async () => {
      this.logger.log(`PYC_NAMESPACE Run with status: ${!!namespace.active}`);
      Promise.resolve()
        .then(() => this.setEntityManager())
        .then(next);
    });
  }

  private setEntityManager() {
    const namespace = getNamespace(PYC_NAMESPACE)!;
    namespace.set<EntityManager>(PYC_ENTITY_MANAGER, this.em);
  }
}
