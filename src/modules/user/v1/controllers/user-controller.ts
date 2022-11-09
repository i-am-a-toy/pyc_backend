import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { PycContext } from 'src/core/decorator/pyc-user.decorator';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { UserResponse } from 'src/dto/user/responses/user.response';
import { IUserService, UserServicekey } from '../interfaces/user-service.interface';

@Controller('users')
export class UserController {
  constructor(@Inject(UserServicekey) private readonly service: IUserService) {}

  @Get('/:id')
  async getProfile(@PycContext() user: PycUser, @Param('id', ParseIntPipe) id: number): Promise<UserResponse> {
    return this.service.findUserById(user.churchId, id);
  }
}
