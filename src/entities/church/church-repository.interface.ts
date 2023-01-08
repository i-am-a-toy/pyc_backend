import { GenericRepository } from 'src/core/database/generic/generic-repository.interface';
import { Church } from './church.entity';

export interface IChurchRepository extends GenericRepository<Church> {}
