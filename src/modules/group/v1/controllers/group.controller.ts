import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { PycContext } from 'src/core/decorator/pyc-user.decorator';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { PaginationQuery } from 'src/dto/common/requests/pagination.query';
import { CreateGroupRequest } from 'src/dto/group/requests/create-group.request';
import { UpdateGroupLeaderRequest } from 'src/dto/group/requests/update-group-leader.request';
import { UpdateGroupNameRequest } from 'src/dto/group/requests/update-group-name.request';
import { GroupListResponse } from 'src/dto/group/responses/group-list.response';
import { GroupResponse } from 'src/dto/group/responses/group.response';
import { IGroupService } from '../interfaces/group-service.interface';
import { GroupServiceKey } from '../services/group.service';

@Controller('groups')
export class GroupController {
  constructor(@Inject(GroupServiceKey) private readonly service: IGroupService) {}

  @Get()
  findAll(@PycContext() pycUser: PycUser, @Query() req: PaginationQuery): Promise<GroupListResponse> {
    return this.service.findAll(pycUser, req.offset, req.limit);
  }

  @Get('/:id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<GroupResponse> {
    return this.service.findById(id);
  }

  @Post()
  async save(@PycContext() pycUser: PycUser, @Body() req: CreateGroupRequest): Promise<void> {
    await this.service.save(pycUser, req);
  }

  @Put('/:id/name')
  async updateName(
    @PycContext() pycUser: PycUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateGroupNameRequest,
  ): Promise<void> {
    await this.service.updateName(pycUser, id, req);
  }

  @Put('/:id/leader')
  async updateLeader(
    @PycContext() pycUser: PycUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateGroupLeaderRequest,
  ): Promise<void> {
    await this.service.updateLeader(pycUser, id, req);
  }

  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.deleteById(id);
  }
}
