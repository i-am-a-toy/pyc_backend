import { Logger, NotFoundException } from '@nestjs/common';
import { Transactional } from 'src/core/decorator/transactional.decorator';
import { CreateCellRequest } from 'src/dto/cell/requests/create-cell.request';
import { UpdateCellRequest } from 'src/dto/cell/requests/update-cell.request';
import { CellListResponse } from 'src/dto/cell/response/cell-list.response';
import { DetailCellResponse } from 'src/dto/cell/response/detail-cell.response';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { ICellRepository } from 'src/entities/cell/cell-repository.interface';
import { Cell } from 'src/entities/cell/cell.entity';
import { IChurchRepository } from 'src/entities/church/church-repository.interface';
import { IGroupRepository } from 'src/entities/group/group-repository.interface';
import { IUserRepository } from 'src/entities/user/user-repository.interface';
import { ICellService } from '../interfaces/cell-service.interface';

export class CellService implements ICellService {
  private readonly logger = new Logger(CellService.name);
  constructor(
    private readonly churchRepository: IChurchRepository,
    private readonly groupRepository: IGroupRepository,
    private readonly cellRepository: ICellRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * save
   *
   * @description churchId, groupId, leaderId를 요청받아 Cell을 생성
   * 만약 새로운 Leader가 기존 Leader가 아닌 Member이하의 권한에서 세워진다면 해당 User의 Role 및 Password 변경
   * @throws Cell 생성에 필요한 데이터가 존재하지 않는 경우{@link NotFoundException}
   *
   * @param pycUser {@link PycUser}
   * @param req {@link CreateCellRequest}
   */
  @Transactional()
  async save(pycUser: PycUser, req: CreateCellRequest): Promise<void> {
    const { groupId, leaderId } = req;
    const church = await this.churchRepository.findById(pycUser.churchId);
    if (!church) {
      this.logger.warn(`Could not find Church with ${pycUser.churchId}`);
      throw new NotFoundException('교회를 찾을 수 없습니다.');
    }

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      this.logger.warn(`Could not find Group with ${groupId}`);
      throw new NotFoundException('그룹을 찾을 수 없습니다.');
    }

    const leader = await this.userRepository.findById(leaderId);
    if (!leader) {
      this.logger.warn(`Could not find leader with ${leaderId}`);
      throw new NotFoundException('리더를 찾을 수 없습니다.');
    }
    leader.changeRoleToCellLeader();
    await this.userRepository.save(leader);

    await this.cellRepository.save(Cell.of(church, group, leader, pycUser.userId));
  }

  /**
   * findByGroupId
   *
   * @description groupId 및 offset, limit을 받아 해당 Group의 Cell 조회
   *
   * @param groupId
   * @param offset {@link offset}, limit {@link limit}
   */
  async findByGroupId(groupId: number, offset: number, limit: number): Promise<CellListResponse> {
    const [entities, count] = await this.cellRepository.findByGroupId(groupId, offset, limit);
    return new CellListResponse(entities, count);
  }

  /**
   * findById
   *
   * @description Cell의 Id를 받아 디테일을 조회
   * @throws ID에 해당하는 Cell이 없는 경우 {@link NotFoundException}
   *
   * @param id
   */
  async findOneById(id: number): Promise<DetailCellResponse> {
    const result = await this.cellRepository.findById(id);
    if (!result) {
      this.logger.warn(`Could not find Cell with ID: ${id}`);
      throw new NotFoundException('셀을 찾을 수 없습니다.');
    }
    return new DetailCellResponse(result);
  }
  update(churchId: number, id: number, req: UpdateCellRequest): Promise<DetailCellResponse> {
    throw new Error('Method not implemented.');
  }
  delete(churchId: number, id: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
