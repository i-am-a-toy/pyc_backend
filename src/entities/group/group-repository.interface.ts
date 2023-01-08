import { GenericRepository } from 'src/core/database/generic/generic-repository.interface';
import { Group } from './group.entity';

export interface IGroupRepository extends GenericRepository<Group> {
  findByName(churchId: number, name: string): Promise<Group | null>;
  findAll(churchId: number, offset: number, limit: number): Promise<[Group[], number]>;
}
