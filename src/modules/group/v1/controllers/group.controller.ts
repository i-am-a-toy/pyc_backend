import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { PycContext } from 'src/core/decorator/pyc-user.decorator';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { PaginationQuery } from 'src/dto/common/requests/pagination.query';
import { CreateGroupRequest } from 'src/dto/group/requests/create-group.request';
import { UpdateGroupRequest } from 'src/dto/group/requests/update-group.request';
import { GroupListResponse } from 'src/dto/group/responses/group-list.response';
import { GroupResponse } from 'src/dto/group/responses/group.response';
import { IGroupService } from '../interfaces/group-service.interface';
import { GROUP_SERVICE_KEY } from '../v1-group.module';

@Controller('groups')
export class GroupController {
  constructor(@Inject(GROUP_SERVICE_KEY) private readonly service: IGroupService) {}

  @Get()
  findAll(@PycContext() pycUser: PycUser, @Query() req: PaginationQuery): Promise<GroupListResponse> {
    return this.service.findAll(pycUser.churchId, req.offset, req.limit);
  }

  @Get('/:id')
  findById(@PycContext() pycUser: PycUser, @Param('id', ParseIntPipe) id: number): Promise<GroupResponse> {
    return this.service.findById(pycUser.churchId, id);
  }

  @Post()
  async save(@PycContext() pycUser: PycUser, @Body() req: CreateGroupRequest): Promise<void> {
    await this.service.save(pycUser.churchId, pycUser.userId, req);
  }

  @Put('/:id')
  async update(
    @PycContext() pycUser: PycUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateGroupRequest,
  ): Promise<void> {
    await this.service.update(pycUser.churchId, id, req);
  }

  @Delete('/:id')
  async delete(@PycContext() pycUser: PycUser, @Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.deleteById(pycUser.churchId, id);
  }
}
