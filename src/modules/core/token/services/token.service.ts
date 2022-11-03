import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessTokenClaim } from 'src/dto/token/access-token-claim.dto';
import { RefreshTokenClaim } from 'src/dto/token/refresh-token-claim.dto';
import { TokenClaim } from 'src/dto/token/token-claim.dto';
import { RefreshToken } from 'src/entities/refresh-token/refresh-token.entity';
import { User } from 'src/entities/user/user.entity';
import { Repository } from 'typeorm';
import { ITokenService } from '../interfaces/token-service.interface';

@Injectable()
export class TokenService implements ITokenService {
  private readonly logger: Logger = new Logger(TokenService.name);
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async createToken(churchId: number, id: string, user: User): Promise<{ accessToken: string }> {
    const accessToken = this.jwtService.sign(
      new TokenClaim(id, churchId, user.id, user.name, user.role.enumName).toPlain(),
    );
    const refreshToken = this.jwtService.sign({ id, churchId, userId: user.id }, { expiresIn: '30d' });
    await this.refreshTokenRepository.save(RefreshToken.of(churchId, user, id, refreshToken));

    return { accessToken };
  }

  verifieToken(token: string): AccessTokenClaim {
    try {
      return this.validate<AccessTokenClaim>(token);
    } catch (e) {
      this.logger.warn(`Token validate failed error: ${e.message}`);
      throw new UnauthorizedException('인증 정보가 유효하지 않습니다.');
    }
  }

  async refresh(accessToken: string): Promise<{ accessToken: string }> {
    try {
      const verified = this.validate<AccessTokenClaim>(accessToken, true);
      const selected = await this.refreshTokenRepository.findOneByOrFail({
        tokenId: verified.id,
        userId: verified.userId,
      });
      const verifiedRefresh = this.validate<RefreshTokenClaim>(selected.refreshToken);

      const newToken = this.jwtService.sign(
        new TokenClaim(
          verifiedRefresh.id,
          verifiedRefresh.churchId,
          verifiedRefresh.userId,
          verified.name,
          verified.roleName,
        ).toPlain(),
      );
      return { accessToken: newToken };
    } catch (e) {
      this.logger.warn(`Failed Token Refresh with Error: ${e.message}`);
      throw new UnauthorizedException('인증 정보가 유효하지 않아 갱신에 실패하였습니다.');
    }
  }

  async removeToken(accessToken: string): Promise<void> {
    try {
      const verified = this.validate<AccessTokenClaim>(accessToken, true);
      const target = await this.refreshTokenRepository.findOneBy({ tokenId: verified.id, userId: verified.userId });
      if (!target) return;
      await this.refreshTokenRepository.remove(target);
    } catch (e) {
      this.logger.warn(`Failed Token removeToken with Error: ${e.message}`);
      throw new UnauthorizedException('인증 정보가 유효하지 않아 인증정보 삭제에 실패하였습니다.');
    }
  }

  private validate<T extends Object>(token: string, ignoreExpiration: boolean = false): T {
    return this.jwtService.verify<T>(token, { ignoreExpiration });
  }
}
