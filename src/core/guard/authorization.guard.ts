import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PycUser } from 'src/dto/common/dto/pyc-user.dto';
import { ITokenService, TokenServiceKey } from 'src/modules/core/token/interfaces/token-service.interface';
import { Role } from 'src/types/role/role.type';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(@Inject(TokenServiceKey) private readonly tokenService: ITokenService) {}

  //1. write WHITELIST
  private readonly WHITELIST = ['/api/v1/auth/login', '/api/v1/auth/refresh'];

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    // check whitelist
    const result = this.WHITELIST.find((path) => req.path.includes(path));
    if (result) return true;

    // check token
    const token = req.headers.authorization;
    if (!token || token === '') throw new UnauthorizedException('인증정보가 없습니다.');

    try {
      const accessClaim = this.tokenService.verifieToken(token);
      const role = Role.findByName(accessClaim.roleName);
      if (!role) throw Error('유효하지 않은 Role입니다.');

      const pycUser = new PycUser(accessClaim.id, accessClaim.churchId, accessClaim.userId, accessClaim.name, role!);
      Object.assign(req, { pycUser });
      return true;
    } catch (e) {
      throw new UnauthorizedException('유효하지 않은 접근입니다.');
    }
  }
}
