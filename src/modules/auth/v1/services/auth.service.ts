import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync } from 'bcrypt';
import { LoginResponse } from 'src/dto/auth/responses/login.response';
import { User } from 'src/entities/user/user.entity';
import { ITokenService, TokenServiceKey } from 'src/modules/core/token/interfaces/token-service.interface';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { IAuthService } from '../interfaces/auth-service.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(TokenServiceKey) private readonly tokenService: ITokenService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async login(churchId: number, name: string, password: string): Promise<LoginResponse> {
    //find user
    const target = await this.usersRepository.findOneByOrFail({ churchId, name });
    if (!target.role.isLeader()) throw new ForbiddenException('새신자, 셀원은 로그인을 할 수 없습니다.');

    if (compareSync(password, target.password!)) {
      const result = await this.tokenService.createToken(churchId, uuid(), target);
      return new LoginResponse(result.accessToken);
    }
    throw new UnauthorizedException('비밀번호가 틀립니다.');
  }

  async logout(accessToken: string): Promise<void> {
    await this.tokenService.removeToken(accessToken);
  }

  async refresh(accessToken: string): Promise<LoginResponse> {
    const result = await this.tokenService.refresh(accessToken);
    return new LoginResponse(result.accessToken);
  }

  //TODO: 비밀번호 변경
  async chagePassword(id: number, prevPassword: string, newPassword: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
