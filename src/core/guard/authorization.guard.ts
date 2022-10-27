import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ITokenService, TokenServiceKey } from 'src/modules/core/token/interfaces/token-service.interface';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(@Inject(TokenServiceKey) private readonly tokenService: ITokenService) {}

  //1. write WHITELIST
  private readonly WHITELIST = [];

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // getRequest를 할 때 제네릭을 사용하지 않음, 그 이유는 이 후 token을 검증 후 Data를 심어줄 것이기 때문
    // 심어준 데이터는 ParameterDecorator에서 꺼내와 사용할 수 있음
    const req = context.switchToHttp().getRequest<Request>();

    const result = this.WHITELIST.find((path) => req.path.includes(path));
    if (result) return true;

    const jwtToken = req.headers.authorization;
    if (!jwtToken || jwtToken === '') {
      throw new UnauthorizedException('인증정보가 없습니다.');
    }

    try {
      const accessClaim = this.tokenService.verifieToken(jwtToken);

      // role 변환

      // return
      Object.assign(req, { pycUser: accessClaim });
      return true;
    } catch (e) {
      throw new UnauthorizedException('유효하지 않은 접근입니다.');
    }
  }
}
