import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { PycContext } from 'src/core/decorator/pyc-user.decorator';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { PaginationQuery } from 'src/dto/common/requests/pagination.query';
import { CreateNoticeCommentRequest } from 'src/dto/notice-comment/requests/create-notice-comment.request';
import { UpdateNoticeCommentRequest } from 'src/dto/notice-comment/requests/update-notice-comment.request';
import { NoticeCommentListResponse } from 'src/dto/notice-comment/responses/notice-comment-list.response';
import { INoticeCommentSerivce } from '../interfaces/notice-comment-service.interface';
import { NoticeCommentServiceKey } from '../serviecs/notice-comment.service';

@Controller('notice-comments')
export class NoticeCommentController {
  constructor(@Inject(NoticeCommentServiceKey) private readonly service: INoticeCommentSerivce) {}

  @Post('/notices/:id')
  async writeComment(
    @PycContext() pycUser: PycUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() req: CreateNoticeCommentRequest,
  ): Promise<void> {
    await this.service.save(pycUser, id, req);
  }

  @Get('/notices/:id')
  findComments(
    @PycContext() pycUser: PycUser,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationQuery,
  ): Promise<NoticeCommentListResponse> {
    const { offset, limit } = query;
    return this.service.findAll(pycUser, id, offset, limit);
  }

  @Put('/:id')
  async modifiyComment(
    @PycContext() pycUser: PycUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateNoticeCommentRequest,
  ): Promise<void> {
    await this.service.update(pycUser, id, req.comment);
  }

  @Delete('/:id')
  async removeComment(@PycContext() pycUser: PycUser, @Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.delete(pycUser, id);
  }
}
