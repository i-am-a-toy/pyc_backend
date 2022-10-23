import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CreateUserRequest } from 'src/dto/user/requests/create-user.request';
import { IUserService } from '../interfaces/user-service.interface';

@Controller('users')
export class UserController {
  constructor(@Inject('userService') private readonly userService: IUserService) {}
  @Post()
  join(@Body() req: CreateUserRequest) {
    return this.userService.save(req);
  }
}
