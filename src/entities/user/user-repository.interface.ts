import { GenericRepository } from 'src/core/database/generic/generic-repository.interface';
import { User } from './user.entity';

export interface IUserRepository extends GenericRepository<User> {}
