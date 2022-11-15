import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidateResponse } from 'src/dto/common/responses/validate.response';
import { CreateUserRequest } from 'src/dto/user/requests/create-user.request';
import { UpdateUserRequest } from 'src/dto/user/requests/update-user.request';
import { UserListResponse } from 'src/dto/user/responses/user-list.response';
import { UserResponse } from 'src/dto/user/responses/user.response';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { Family } from 'src/entities/family/family.entity';
import { User } from 'src/entities/user/user.entity';
import { LEADER_TYPE } from 'src/enum/leader-type.enum';
import { Rank } from 'src/types/rank/rank.type';
import { Role } from 'src/types/role/role.type';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { IUserService } from '../interfaces/user-service.interface';

@Injectable()
export class UserService implements IUserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async save(churchId: number, req: CreateUserRequest): Promise<UserResponse> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      const church = await qr.manager.findOneByOrFail(Church, { id: churchId });
      const newUser = req.toEntity();

      const saved = req.cellId
        ? await this.saveMember(qr, req.cellId, newUser, church)
        : await this.saveNewbie(qr, newUser, church);

      await qr.commitTransaction();
      return new UserResponse(saved);
    } catch (e) {
      this.logger.error(`Failed Save User Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async findUserById(churchId: number, id: number): Promise<UserResponse> {
    const result = await this.repository.findOneByOrFail({ churchId, id });
    return new UserResponse(result);
  }

  async findUsersByName(churchId: number, name: string, offset: number, limit: number): Promise<UserListResponse> {
    const [rows, count] = await this.repository
      .createQueryBuilder('users')
      .where('church_id = :churchId', { churchId })
      .andWhere('name ~ :name', { name })
      .skip(offset)
      .limit(limit)
      .getManyAndCount();

    return new UserListResponse(rows, count);
  }

  async findUsersByRole(churchId: number, role: Role, offset: number, limit: number): Promise<UserListResponse> {
    const [rows, count] = await this.repository
      .createQueryBuilder('users')
      .where('role = :role', { role: role.role })
      .andWhere('church_id = :churchId', { churchId })
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return new UserListResponse(rows, count);
  }

  async findUsersByRank(churchId: number, rank: Rank, offset: number, limit: number): Promise<UserListResponse> {
    const [rows, count] = await this.repository
      .createQueryBuilder('users')
      .where('rank = :rank', { rank: rank.rank })
      .andWhere('church_id = :churchId', { churchId })
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return new UserListResponse(rows, count);
  }

  async findUsersWithoutCell(churchId: number, offset: number, limit: number): Promise<UserListResponse> {
    const [rows, count] = await this.repository
      .createQueryBuilder('users')
      .where('users.cell_id is null')
      .andWhere('church_id = :churchId', { churchId })
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return new UserListResponse(rows, count);
  }

  async resultByName(churchId: number, name: string): Promise<ValidateResponse> {
    const result = await this.repository.findOneBy({ churchId, name });
    return new ValidateResponse(result ? true : false);
  }

  async findUserTobeLeader(churchId: number, type: LEADER_TYPE, familyId: number | null): Promise<UserListResponse> {
    if (type === LEADER_TYPE.CELL && !familyId) {
      throw new BadRequestException('셀리더를 찾기 위해서는 familyId가 필요합니다.');
    }

    const result =
      LEADER_TYPE.CELL === type
        ? await this.findTobeCellLeader(churchId, familyId!)
        : await this.findTobeFamilyLeader(churchId);
    return result;
  }

  async findTobeFamilyLeader(churchId: number): Promise<UserListResponse> {
    const [rows, count] = await this.repository
      .createQueryBuilder('user')
      .leftJoin(Family, 'family', '(user.id != family.leader_id OR user.id != family.sub_leader_id)')
      .where('(user.id != family.leader_id AND user.id != family.sub_leader_id)')
      .andWhere('user.role = :role', { role: Role.LEADER.enumName })
      .andWhere('family.church_id = :churchId', { churchId })
      .getManyAndCount();

    return new UserListResponse(rows, count);
  }

  async findTobeCellLeader(churchId: number, familyId: number): Promise<UserListResponse> {
    const [rows, count] = await this.repository
      .createQueryBuilder('user')
      .leftJoin(Cell, 'cell', 'user.cell_id = cell.id')
      .leftJoin(Family, 'family', 'cell.family_id = family.id')
      .andWhere('family.church_id = :churchId', { churchId })
      .andWhere('family.id = :familyId', { familyId })
      .andWhere('user.role = :role', { role: Role.MEMBER.enumName })
      .getManyAndCount();

    return new UserListResponse(rows, count);
  }

  async updateCell(churchId: number, prevCellId: number, targetCellId: number, id: number): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();
    try {
      const user = await qr.manager.findOneByOrFail(User, { churchId, cellId: prevCellId, id });

      const targetCell = await qr.manager.findOneByOrFail(Cell, { churchId, id: targetCellId });
      user.changeCell(targetCell);
      await qr.manager.save(user);

      await qr.commitTransaction();
    } catch (e) {
      this.logger.error(`Failed UpdateCell Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async updateInfo(churchId: number, id: number, req: UpdateUserRequest): Promise<UserResponse> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();
    try {
      const user = await qr.manager.findOneByOrFail(User, { churchId, id });
      user.updateFromRequest(req);

      const updated = await qr.manager.save(user);
      await qr.commitTransaction();
      return new UserResponse(updated);
    } catch (e) {
      this.logger.error(`Failed UpdateInfo Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async deleteById(churchId: number, id: number): Promise<void> {
    // 삭제의 대상이 되는 유저인지 확인
    const target = await this.repository.findOneByOrFail({ churchId, id });
    if (target.role.isLeader()) throw new BadRequestException('리더는 삭제할 수 없습니다.');
    await this.repository.remove(target);
  }

  // save member
  private async saveMember(qr: QueryRunner, cellId: number, user: User, church: Church): Promise<User> {
    const cell = await qr.manager.findOneByOrFail(Cell, { id: cellId, churchId: church.id });
    user.changeCell(cell);
    user.changeChurch(church);
    return qr.manager.save(user);
  }

  private async saveNewbie(qr: QueryRunner, user: User, church: Church): Promise<User> {
    user.changeChurch(church);
    return qr.manager.save<User>(user);
  }
}
