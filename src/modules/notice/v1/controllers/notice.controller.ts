import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { PycContext } from 'src/core/decorator/pyc-user.decorator';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { PaginationQuery } from 'src/dto/common/requests/pagination.query';
import { CreateNoticeRequest } from 'src/dto/notice/requests/create-notice.request';
import { UpdateNoticeRequest } from 'src/dto/notice/requests/update-notice.request';
import { NoticeListResponse } from 'src/dto/notice/responses/notice-list.response';
import { NoticeResponse } from 'src/dto/notice/responses/notice.response';
import { INoticeService } from '../interfaces/notcie-service.interface';
import { NoticeServiceKey } from '../services/notice.service';

@Controller('notices')
export class NoticeController {
  constructor(@Inject(NoticeServiceKey) private readonly service: INoticeService) {}

  @Post()
  async post(@PycContext() user: PycUser, @Body() req: CreateNoticeRequest): Promise<void> {
    await this.service.save(user, req);
  }

  @Get('/:id')
  async findOneById(@PycContext() user: PycUser, @Param('id', ParseIntPipe) id: number): Promise<NoticeResponse> {
    return this.service.findOneById(user.churchId, id);
  }

  @Get()
  async findAll(@PycContext() user: PycUser, @Query() query: PaginationQuery): Promise<NoticeListResponse> {
    return this.service.findAll(user.churchId, query.offset, query.limit);
  }

  @Put('/:id')
  async update(
    @PycContext() user: PycUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateNoticeRequest,
  ): Promise<void> {
    await this.service.update(user, id, req);
  }

  @Delete('/:id')
  async delete(@PycContext() user: PycUser, @Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.deleteById(user.churchId, id);
  }
}
