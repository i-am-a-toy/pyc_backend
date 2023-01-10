import { GenericRepository } from 'src/core/database/generic/generic-repository.interface';
import { Cell } from './cell.entity';

export interface ICellRepository extends GenericRepository<Cell> {
  findByLeaderId(id: number): Promise<Cell | null>;
  findByGroupId(groupId: number, offset: number, limit: number): Promise<[Cell[], number]>;
  isExistByGroupId(id: number, leaderId: number): Promise<boolean>;
}
