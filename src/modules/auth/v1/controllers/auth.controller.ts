import { Body, Controller, Get, Headers, Inject, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ChangePasswordRequest } from 'src/dto/auth/requests/change-password.request';
import { LoginRequest } from 'src/dto/auth/requests/login.request';
import { TokenResponse } from 'src/dto/auth/responses/login.response';
import { ValidateResponse } from 'src/dto/common/responses/validate.response';
import { AuthServiceKey, IAuthService } from '../interfaces/auth-service.interface';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthServiceKey) private readonly authService: IAuthService) {}

  @Get('token/validate')
  validateToken(@Headers('Authorization') auth: string): ValidateResponse {
    const [_, token] = auth.split(' ');
    return this.authService.isValidated(token);
  }

  @Post('/login')
  async login(@Body() req: LoginRequest): Promise<TokenResponse> {
    return this.authService.login(req.name, req.password);
  }

  @Post('/logout')
  async logout(@Headers('Authorization') auth: string) {
    const [_, token] = auth.split(' ');
    return this.authService.refresh(token);
  }

  @Put('/refresh')
  async refresh(@Headers('Authorization') auth: string): Promise<TokenResponse> {
    const [_, token] = auth.split(' ');
    return this.authService.refresh(token);
  }

  @Put('/:id/password/change')
  async changePassword(@Param('id', ParseIntPipe) id: number, @Body() req: ChangePasswordRequest): Promise<void> {
    await this.authService.chagePassword(id, req.prevPassword, req.newPassword);
  }
}
