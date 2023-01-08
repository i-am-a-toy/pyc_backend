import { Injectable } from '@nestjs/common';
import { GenericTypeOrmRepository } from 'src/core/database/typeorm/generic-typeorm.repository';
import { EntityTarget } from 'typeorm';
import { ICellRepository } from './cell-repository.interface';
import { Cell } from './cell.entity';

@Injectable()
export class CellRepository extends GenericTypeOrmRepository<Cell> implements ICellRepository {
  getName(): EntityTarget<Cell> {
    return Cell.name;
  }

  findByLeaderId(id: number): Promise<Cell | null> {
    return this.getRepository().findOneBy({ leaderId: id });
  }

  async isExistByGroupId(id: number): Promise<boolean> {
    const result = await this.getRepository().find({ where: { groupId: id }, take: 1 });
    return result.length ? true : false;
  }
}
