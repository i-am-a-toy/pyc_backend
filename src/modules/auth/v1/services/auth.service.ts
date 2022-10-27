import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync } from 'bcrypt';
import { TokenResponse } from 'src/dto/auth/responses/login.response';
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

  async login(name: string, password: string): Promise<TokenResponse> {
    const target = await this.usersRepository.findOneByOrFail({ name });
    if (!target.role.isLeader()) throw new ForbiddenException('새신자, 셀원은 로그인을 할 수 없습니다.');

    if (compareSync(password, target.password!)) {
      const result = await this.tokenService.createToken(target.churchId, uuid(), target);
      return new TokenResponse(result.accessToken);
    }
    throw new UnauthorizedException('비밀번호가 틀립니다.');
  }

  async logout(accessToken: string): Promise<void> {
    await this.tokenService.removeToken(accessToken);
  }

  async refresh(accessToken: string): Promise<TokenResponse> {
    const result = await this.tokenService.refresh(accessToken);
    return new TokenResponse(result.accessToken);
  }

  async chagePassword(id: number, prevPassword: string, newPassword: string): Promise<void> {
    const target = await this.usersRepository.findOneByOrFail({ id: id });
    if (!target.role.isLeader()) throw new ForbiddenException('새신자, 셀원은 비밀번호를 수정할 수 없습니다.');
    if (!compareSync(prevPassword, target.password!)) {
      throw new UnauthorizedException('입력한 비밀번호가 기존 비밀번호와 다릅니다.');
    }

    target.changePassword(newPassword);
    await this.usersRepository.save(target);
  }
}
