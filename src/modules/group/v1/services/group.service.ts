import { BadRequestException, ConflictException, Inject, Logger, NotFoundException } from '@nestjs/common';
import { Transactional } from 'src/core/decorator/transactional.decorator';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateGroupRequest } from 'src/dto/group/requests/create-group.request';
import { UpdateGroupLeaderRequest } from 'src/dto/group/requests/update-group-leader.request';
import { UpdateGroupNameRequest } from 'src/dto/group/requests/update-group-name.request';
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
import { User } from 'src/entities/user/user.entity';
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
    const { leaderId, name } = req;

    const church = await this.churchRepository.findById(churchId);
    if (!church) {
      this.logger.warn(`Could not find Church with Id: ${churchId}`);
      throw new NotFoundException(`교회를 찾을 수 없습니다.`);
    }

    const isExist = await this.isExistName(churchId, name);
    if (isExist) {
      this.logger.warn(`Could not use ${name}, is Exist`);
      throw new ConflictException(`이미 존재하는 이름입니다.`);
    }

    const leader = await this.userRepository.findById(leaderId);
    if (!leader) {
      this.logger.warn(`Could not find leader with Id: ${leader}`);
      throw new NotFoundException('리더를 찾을 수 없습니다.');
    }

    leader.changeToGroupLeaderRole();
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
   * updateName
   *
   * @description Group의 Id와 그룹 변경할 이름을 받아 Group의 이름 수정
   * @throws 그룹 수정에 필요한 데이터가 존재하지 않는 경우{@link NotFoundException}
   * @throws 그룹의 이름이 중복 되는 경우 {@link ConflictException}
   *
   * @param pycUser {@link pycUser}
   * @param id
   * @param req {@link UpdateGroupRequest}
   */
  @Transactional()
  async updateName(pycUser: PycUser, id: number, req: UpdateGroupNameRequest): Promise<void> {
    const group = await this.groupRepository.findById(id);
    if (!group) throw new NotFoundException('그룹을 찾을 수 없습니다.');

    // check is Update Name & duplicate
    const isExist = await this.isExistName(pycUser.churchId, req.name);
    if (group.name != req.name && isExist) {
      this.logger.warn(`Could not use ${req.name}, is Exist`);
      throw new ConflictException(`이미 존재하는 이름입니다.`);
    }
    group.changeName(req.name, pycUser.userId);
    await this.groupRepository.save(group);
  }

  /**
   * updateLeader
   *
   * @description Group의 Id와 그룹 LeaderId, 받아 Group의 Leader를 변경
   * 기존 그룹의 Leader가 Cell의 Leader인 경우를 판단하여 해당 User의 정보를 수정해준다.
   * 만약 Cell리더가 아니라면 해당 User를 Member로 변경
   * 새로운 그룹의 Leader의 Role은 Group Leader로 변경 된다.
   * @throws 그룹 수정에 필요한 데이터가 존재하지 않는 경우{@link NotFoundException}
   *
   * @param pycUser {@link pycUser}
   * @param id
   * @param req {@link UpdateGroupLeaderRequest}
   */
  async updateLeader(pycUser: PycUser, id: number, req: UpdateGroupLeaderRequest): Promise<void> {
    const group = await this.groupRepository.findById(id);
    if (!group) throw new NotFoundException('그룹을 찾을 수 없습니다.');

    const newLeader = await this.userRepository.findById(req.leaderId);
    if (!newLeader) throw new NotFoundException('그룹의 리더가 될 대상을 찾을 수 없습니다.');
    newLeader.changeToGroupLeaderRole();
    await this.userRepository.save([newLeader]);

    // process Group Leader
    if (group.leader) await this.processPrevLeader(group.leader, { isDelete: false });

    group.changeLeader(newLeader, pycUser.userId);
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
    const group = await this.groupRepository.findById(id);
    if (!group) return;

    const isExist = await this.cellRepository.isExistByGroupId(id, group.leader!.id);
    if (isExist) throw new BadRequestException('하위 셀이 존재하여 삭제할 수 없습니다.');

    // process Group Leader
    if (group.leader) await this.processPrevLeader(group.leader, { isDelete: true });

    await this.groupRepository.remove(group);
  }

  /**
   * processPrevLeader
   *
   * @description Group의 이전 Leader에 대한 처를 하는 private method
   * 이전 Leader가 Cell Leader라면 해당 Leader의 Role을 Leader로 변경
   * 이전 Leader가 Cell Leader가 아니면 Leader를 내려놓은 것으로 판단하여 Role을 Member로 변경 및 Password 삭제
   *
   * @param prevLeader {@link User}: Group의 prev Leader
   * @param options: 해당 method를 호출 할 때 update에서 호출인지 delete에서 호출인지 판별할 수 있는 구분자
   */
  private async processPrevLeader(prevLeader: User, options: { isDelete: boolean }): Promise<void> {
    const prevLeaderCell = await this.cellRepository.findByLeaderId(prevLeader.id);

    // update prevLeader Role & password
    prevLeaderCell ? prevLeader.changeRole(Role.LEADER) : prevLeader.putDownLeader();

    // update prevLeader Group to null
    if (prevLeaderCell && options.isDelete) {
      prevLeaderCell.changeGroup(null);
      await this.cellRepository.save(prevLeaderCell);
    }

    await this.userRepository.save(prevLeader);
  }

  private async isExistName(churchId: number, name: string): Promise<boolean> {
    const isExist = await this.groupRepository.findByName(churchId, name);
    return !!isExist;
  }
}
