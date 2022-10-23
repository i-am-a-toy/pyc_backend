import { Controller, Inject } from '@nestjs/common';
import { IUserService } from '../interfaces/user-service.interface';

@Controller('users')
export class UserController {
  constructor(@Inject('userService') private readonly userService: IUserService) {}
}