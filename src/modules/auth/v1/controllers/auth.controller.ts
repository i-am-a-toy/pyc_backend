import { Controller, Inject, Post, Put } from '@nestjs/common';
import { AuthServiceKey, IAuthService } from '../interfaces/auth-service.interface';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthServiceKey) private readonly authService: IAuthService) {}

  @Post('/login')
  async login() {}

  @Post('/logout')
  async logout() {}

  @Put('/refresh')
  async refresh() {}

  @Put('/:id/password/change')
  async changePassword() {}
}
