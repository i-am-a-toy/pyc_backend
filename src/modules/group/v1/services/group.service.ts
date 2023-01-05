import { BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidateResponse } from 'src/dto/common/responses/validate.response';
import { CreateFamilyRequest } from 'src/dto/family/requests/create-family.request';
import { UpdateFamilyRequest } from 'src/dto/family/requests/update-family.request';
import { GroupListResponse } from 'src/dto/family/responses/group-list.response';
import { GroupResponse } from 'src/dto/family/responses/group.response';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { Group } from 'src/entities/group/group.entity';
import { User } from 'src/entities/user/user.entity';
import { Role } from 'src/types/role/role.type';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { IGroupService } from '../interfaces/group-service.interface';

export class GroupService implements IGroupService {
  private readonly logger: Logger = new Logger(GroupService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Group) private readonly repository: Repository<Group>,
  ) {}

  async save(churchId: number, userId: number, req: CreateFamilyRequest): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      // find Church & find leader & find subleader
      const church = await qr.manager.findOneByOrFail(Church, { id: req.churchId });
      const [leader, subLeader] = await this.getUpdatedNewLeaders(qr, church.id, req.leaderId, req.subLeaderId);

      // save Family
      const family = await qr.manager.save(Group.of(church, leader!, req.name, 1));

      // update leader & subleader Cell
      await Promise.all([this.updateLeaderCell(qr, family, leader), this.updateLeaderCell(qr, family, subLeader)]);

      await qr.commitTransaction();
    } catch (e) {
      this.logger.error(`Failed Save Family Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async findAll(churchId: number, offset: number, limit: number): Promise<GroupListResponse> {
    const [families, count] = await this.repository.findAndCount({
      where: { churchId },
      skip: offset,
      take: limit,
    });
    return new GroupListResponse(families, count);
  }

  async findById(churchId: number, id: number): Promise<GroupResponse> {
    const selected = await this.repository.findOneOrFail({
      where: { churchId, id },
      relations: ['leader', 'subLeader', 'cells'],
    });

    return new GroupResponse(selected);
  }

  async isUsedName(churchId: number, name: string): Promise<ValidateResponse> {
    const family = await this.repository.findOneBy({ churchId, name });
    return new ValidateResponse(family ? true : false);
  }

  async update(churchId: number, id: number, req: UpdateFamilyRequest): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      const target = await qr.manager.findOneOrFail(Group, {
        where: { churchId, id },
        relations: ['leader', 'subLeader'],
      });
      // target.changeName(req.name);

      // // check request leaderId & request leaderId
      // if (this.isEqualUpdateLeaderRequest(target, req.leaderId, req.subLeaderId)) {
      //   const updated = await qr.manager.save(target);
      //   await qr.commitTransaction();
      //   return new DetailFamilyResponse(updated);
      // }

      // // prev leader 처리
      // await Promise.all([
      //   this.updatePrevFamilyLeader(qr, target.leader),
      //   this.updatePrevFamilyLeader(qr, target.subLeader),
      // ]);

      // // new Family Leaders
      // const [leader, subLeader] = await this.getUpdatedNewLeaders(qr, churchId, req.leaderId, req.subLeaderId);
      // target.changeLeader(leader!);
      // target.changeSubLeader(subLeader);

      // // update leader & subleader Cell
      // await Promise.all([this.updateLeaderCell(qr, target, leader), this.updateLeaderCell(qr, target, subLeader)]);

      // // update Family
      // const updatedFamily = await qr.manager.save(target);
      // await qr.commitTransaction();
    } catch (e) {
      this.logger.error(`Failed Update Family Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async deleteById(churchId: number, id: number): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      // target 찾기
      const target = await qr.manager.findOneOrFail(Group, {
        where: { churchId, id },
        relations: ['leader', 'subLeader', 'cells'],
      });

      // prev leader 처리
      await Promise.all([this.updatePrevFamilyLeader(qr, target.leader, true)]);

      // delete Family
      await qr.manager.remove(target);
      await qr.commitTransaction();
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  private async findToBeLeader(qr: QueryRunner, churchId: number, id: number | null, role: Role): Promise<User | null> {
    if (!id) return null;

    // find Leader
    const targetUser = await qr.manager.findOneByOrFail(User, { churchId, id });

    if (!targetUser.role.isAbleFamilyLeader()) {
      throw new BadRequestException('새신자 또는 셀원은 팸장, 부팸장이 될 수 없습니다.');
    }

    // update target Leader Role
    targetUser.changeRole(role);
    return targetUser;
  }

  private async getUpdatedNewLeaders(
    qr: QueryRunner,
    churchId: number,
    leaderId: number,
    subLeaderId: number | null,
  ): Promise<(User | null)[]> {
    const [leader, subLeader] = await Promise.all([
      this.findToBeLeader(qr, churchId, leaderId, Role.FAMILY_LEADER),
      this.findToBeLeader(qr, churchId, subLeaderId, Role.SUB_FAMILY_LEADER),
    ]);

    await qr.manager.save([leader]);
    if (subLeader) await qr.manager.save([subLeader]);
    return [leader, subLeader];
  }

  private async updateLeaderCell(qr: QueryRunner, group: Group, leader: User | null): Promise<void> {
    // if (!leader) return;
    // const cell = await qr.manager.findOneBy(Cell, { leaderId: leader.id });
    // if (!cell) return;
    // cell.changeFamily(Group);
    // await qr.manager.save(Cell, cell);
  }

  private isEqualUpdateLeaderRequest(group: Group, leaderId: number, subLeaderId: number | null): boolean {
    // return leaderId === family.leader.id && subLeaderId === family.subLeader?.id;
    return true;
  }

  private async updatePrevFamilyLeader(qr: QueryRunner, leader: User | null, isDelete: boolean = false): Promise<void> {
    if (!leader) return;
    const cell = await qr.manager.findOneBy(Cell, { leaderId: leader.id });
    if (cell) {
      leader.changeRole(Role.LEADER);
      if (isDelete) cell.changeFamily(null);
      await qr.manager.save([cell, leader]);
      return;
    }

    leader.putDownLeader();
    await qr.manager.save(leader);
  }

  private resultCell(cells: Cell[], leaderId: number, subLeaderId: number | null): boolean {
    if (!cells.length) return false;

    const excludeCellList = cells.filter((c) => c.leaderId !== leaderId && c.leaderId !== subLeaderId);
    return excludeCellList.length ? true : false;
  }
}