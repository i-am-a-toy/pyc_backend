import { BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCellRequest } from 'src/dto/cell/requests/create-cell.request';
import { UpdateCellRequest } from 'src/dto/cell/requests/update-cell.request';
import { CellListResponse } from 'src/dto/cell/response/cell-list.response';
import { DetailCellResponse } from 'src/dto/cell/response/detail-cell.response';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { Family } from 'src/entities/family/family.entity';
import { User } from 'src/entities/user/user.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ICellService } from '../interfaces/cell-service.interface';

export class CellService implements ICellService {
  private readonly logger = new Logger(CellService.name);
  constructor(
    @InjectRepository(Cell) private readonly repository: Repository<Cell>,
    private readonly dataSource: DataSource,
  ) {}

  async save(churchId: number, req: CreateCellRequest): Promise<DetailCellResponse> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      const church = await qr.manager.findOneByOrFail(Church, { id: churchId });
      const family = req.familyId ? await qr.manager.findOneByOrFail(Family, { id: req.familyId }) : null;
      const leader = await qr.manager.findOneByOrFail(User, { id: req.leaderId });
      if (!leader.role.isAbleLeader()) throw new BadRequestException('새신자는 리더가 될 수 없습니다.');

      const savedCell = await qr.manager.save(Cell, Cell.of(church, family, leader));

      leader.changeCell(savedCell);
      leader.toBeLeader();
      await qr.manager.save(User, leader);

      await qr.commitTransaction();
      return new DetailCellResponse(savedCell);
    } catch (e) {
      this.logger.error(`Failed Save Cell Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async findAllByFamilyId(
    churchId: number,
    familyId: number,
    offset: number,
    limit: number,
  ): Promise<CellListResponse> {
    const [cells, count] = await this.repository.findAndCount({
      where: { churchId, familyId },
      skip: offset,
      take: limit,
    });
    return new CellListResponse(cells, count);
  }

  async findOneById(churchId: number, id: number): Promise<DetailCellResponse> {
    const selected = await this.repository.findOneOrFail({ where: { churchId, id }, relations: ['leader', 'members'] });
    return new DetailCellResponse(selected);
  }

  async update(churchId: number, id: number, req: UpdateCellRequest): Promise<DetailCellResponse> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();
    try {
      const target = await qr.manager.findOneOrFail(Cell, { where: { churchId, id }, relations: ['leader'] });
      if (this.isEqualUpdateRequest(target, req)) {
        await qr.commitTransaction();
        return new DetailCellResponse(target);
      }

      //update family & Leader
      if (target.familyId !== req.familyId && req.familyId) await this.updateFamily(qr, target, churchId, req.familyId);
      if (target.leaderId !== req.leaderId && req.leaderId) await this.updateLeader(qr, target, churchId, req.leaderId);

      const updated = await qr.manager.save(Cell, target);
      await qr.commitTransaction();
      return new DetailCellResponse(updated);
    } catch (e) {
      this.logger.error(`Failed Update Cell Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async delete(churchId: number, id: number): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.startTransaction();

    try {
      const target = await qr.manager.findOneOrFail(Cell, {
        where: { churchId, id },
        relations: ['leader', 'members'],
      });
      if (this.resultMember(target.members, target.leaderId)) throw new Error('셀원이 있는 셀은 삭제할 수 없습니다.');

      const targetLeader = await qr.manager.findOneByOrFail(User, { churchId, id: target.leaderId });
      targetLeader.putDownLeader();
      await qr.manager.save(User, targetLeader);

      await qr.query(`DELETE from "cells" WHERE ("church_id" = $1 AND "id" = $2)`, [churchId, id]);
      await qr.commitTransaction();
    } catch (e) {
      this.logger.error(`Failed Delete Cell Error: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  private isEqualUpdateRequest(cell: Cell, req: UpdateCellRequest): boolean {
    if (cell.leaderId === req.leaderId || cell.familyId === req.familyId) return true;
    return false;
  }

  private async updateFamily(qr: QueryRunner, cell: Cell, churchId: number, familyId: number): Promise<void> {
    const family = await qr.manager.findOneByOrFail(Family, { churchId: churchId, id: familyId });
    cell.changeFamily(family);
  }

  private async updateLeader(qr: QueryRunner, cell: Cell, churchId: number, leaderId: number): Promise<void> {
    cell.leader.putDownLeader();
    await this.dataSource.manager.save(User, cell.leader);

    const leader = await qr.manager.findOneByOrFail(User, { churchId: churchId, id: leaderId });
    cell.changeLeader(leader);
  }

  private resultMember(members: User[], leaderId: number): boolean {
    if (!members.length) return false;

    return members.some((m) => m.id !== leaderId);
  }
}
