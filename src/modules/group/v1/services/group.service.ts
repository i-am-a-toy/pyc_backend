import { BadRequestException, ConflictException, Inject, Logger, NotFoundException } from '@nestjs/common';
import { Transactional } from 'src/core/decorator/transactional.decorator';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateGroupRequest } from 'src/dto/group/requests/create-group.request';
import { UpdateGroupRequest } from 'src/dto/group/requests/update-group.request';
import { GroupListResponse } from 'src/dto/group/responses/group-list.response';
import { GroupResponse } from 'src/dto/group/responses/group.response';
import { ICellRepository } from 'src/entities/cell/cell-repository.interface';
import { CellRepository } from 'src/entities/cell/cell.repository';
import { IChurchRepository } from 'src/entities/church/church-repository.interface';
import { ChurchRepository } from 'src/entities/church/church.repository';
import { IGroupRepository } from 'src/entities/group/group-repository.interface';
import { Group } from 'src/entities/group/group.entity';
import { GroupRepository } from 'src/entities/group/group.repository';
import { IUserRepository } from 'src/entities/user/user-repository.interface';
import { UserRepository } from 'src/entities/user/user.repository';
import { Role } from 'src/types/role/role.type';
import { IGroupService } from '../interfaces/group-service.interface';

export class GroupService implements IGroupService {
  private readonly logger: Logger = new Logger(GroupService.name);

  constructor(
    @Inject(ChurchRepository) private readonly churchRepository: IChurchRepository,
    @Inject(GroupRepository) private readonly groupRepository: IGroupRepository,
    @Inject(CellRepository) private readonly cellRepository: ICellRepository,
    @Inject(UserRepository) private readonly userRepository: IUserRepository,
  ) {}

  /**
   * save
   *
   * @description  그룹 몇, 그룹 리더 Id를 요청받아 Group을 생성하는 Request
   * @throws 그룹 생성에 필요한 데이터가 존재하지 않는 경우{@link NotFoundException}
   * @throws 그룹의 이름이 중복 되는 경우 {@link ConflictException}
   *
   * @param pycUser {@link PycUser}
   * @param req {@link CreateGroupRequest}
   */
  @Transactional()
  async save(pycUser: PycUser, req: CreateGroupRequest): Promise<void> {
    const { churchId, userId } = pycUser;

    const church = await this.churchRepository.findById(churchId);
    if (!church) {
      this.logger.warn(`Could not find Church with Id: ${churchId}`);
      throw new NotFoundException(`교회를 찾을 수 없습니다.`);
    }
    const { leaderId, name } = req;
    const isExist = await this.groupRepository.findByName(churchId, name);
    if (isExist) {
      this.logger.warn(`Could not use ${name}, is Exist`);
      throw new ConflictException(`이미 존재하는 이름입니다.`);
    }

    const leader = await this.userRepository.findById(leaderId);
    if (!leader) {
      this.logger.warn(`Could not find leader with Id: ${leader}`);
      throw new NotFoundException('리더를 찾을 수 없습니다.');
    }

    leader.changeRole(Role.GROUP_LEADER);
    await this.userRepository.save(leader);
    await this.groupRepository.save(Group.of(church, leader, name, userId));
  }

  /**
   * findAll
   *
   * @description churchId 및 offset, limit을 받아 church의 그룹 조회
   *
   * @param pycUser {@link pycUser}
   * @param offset {@link offset}, limit {@link limit}
   */
  async findAll(pycUser: PycUser, offset: number, limit: number): Promise<GroupListResponse> {
    const [entities, count] = await this.groupRepository.findAll(pycUser.churchId, offset, limit);
    return new GroupListResponse(entities, count);
  }

  /**
   * findById
   *
   * @description Group의 Id를 받아 디테일을 조회
   *
   * @param id
   */
  async findById(id: number): Promise<GroupResponse> {
    const group = await this.groupRepository.findById(id);
    if (!group) throw new NotFoundException('그룹을 찾을 수 없습니다.');
    return new GroupResponse(group);
  }

  /**
   * update
   *
   * @description Group의 Id와 그룹 LeaderId, 그룹 명을 받아 Group을 Update
   * 기존 그룹의 Leader가 Cell의 Leader인 경우를 판단하여 해당 User의 정보를 수정해준다.
   * 만약 Cell리더가 아니라면 해당 User를 Member로 변경
   * 새로운 그룹의 Leader의 Role은 Group Leader로 변경 된다.
   * @throws 그룹 수정에 필요한 데이터가 존재하지 않는 경우{@link NotFoundException}
   * @throws 그룹의 이름이 중복 되는 경우 {@link ConflictException}
   *
   * @param pycUser
   * @param id
   * @param req
   */
  @Transactional()
  async update(pycUser: PycUser, id: number, req: UpdateGroupRequest): Promise<void> {
    const group = await this.groupRepository.findById(id);
    if (!group) throw new NotFoundException('그룹을 찾을 수 없습니다.');

    if (group.name != req.name) {
      const isExist = await this.groupRepository.findByName(pycUser.churchId, req.name);
      if (!isExist) {
        this.logger.warn(`Could not use ${name}, is Exist`);
        throw new ConflictException(`이미 존재하는 이름입니다.`);
      }
    }

    const newLeader = await this.userRepository.findById(req.leaderId);
    if (!newLeader) throw new NotFoundException('그룹의 리더가 될 대상을 찾을 수 없습니다.');

    if (group.leader) {
      const prevLeaderCell = await this.cellRepository.findByLeaderId(group.leader.id);
      prevLeaderCell ? group.leader.changeRole(Role.LEADER) : group.leader.putDownLeader();
      await this.userRepository.save([group.leader]);
    }

    newLeader.changeRole(Role.GROUP_LEADER);
    await this.userRepository.save([newLeader]);

    group.updateGroup(newLeader, req.name, pycUser.userId);
    await this.groupRepository.save(group);
  }

  /**
   * deleteById
   *
   * @description Group의 Id를 이용해 Group을 삭제하는 요청
   * Group의 Leader가 Cell리더인 경우 해당 Cell의 Group을 제거하여 저장을 해준다.
   * 만약 Cell리더가 아니라면 해당 User를 Member로 변경
   * @throws Group 하위에 Cell이 존재할 경우 {@link BadRequestException}
   *
   * @param id
   */
  @Transactional()
  async deleteById(id: number): Promise<void> {
    const isExist = await this.cellRepository.isExistByGroupId(id);
    if (isExist) throw new BadRequestException('하위 셀이 존재하여 삭제할 수 없습니다.');

    const group = await this.groupRepository.findById(id);
    if (!group) return;

    if (group.leader) {
      const leaderCell = await this.cellRepository.findByLeaderId(group.leader.id);
      leaderCell
        ? (group.leader.changeRole(Role.LEADER),
          leaderCell.changeGroup(null),
          await this.cellRepository.save(leaderCell))
        : group.leader.putDownLeader();
      await this.userRepository.save(group.leader);
    }

    await this.groupRepository.remove(group);
  }
}
