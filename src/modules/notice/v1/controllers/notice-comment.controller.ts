import { Body, Controller, Delete, Inject, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { PycContext } from 'src/core/decorator/pyc-user.decorator';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { CreateNoticeCommentRequest } from 'src/dto/notice-comment/request/create-notice-comment.request';
import { UpdateNoticeCommentRequest } from 'src/dto/notice-comment/request/update-notice-comment.request';
import { INoticeCommentService } from '../interfaces/notice-comment.interface';
import { NoticeCommentServiceKey } from '../services/notice-comment.service';

@Controller('notice-comments')
export class NoticeCommentController {
  constructor(@Inject(NoticeCommentServiceKey) private readonly service: INoticeCommentService) {}

  @Post('/notices/:id')
  async putComment(
    @PycContext() pycUser: PycUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() req: CreateNoticeCommentRequest,
  ): Promise<void> {
    await this.service.save(pycUser, id, req);
  }

  @Put('/:id')
  async modifiyComment(
    @PycContext() pycUser: PycUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateNoticeCommentRequest,
  ) {
    await this.service.update(pycUser, id, req.comment);
  }

  @Delete('/:id')
  async deleteComment(@PycContext() pycUser: PycUser, @Param('id', ParseIntPipe) id: number) {
    await this.service.delete(pycUser, id);
  }
}
