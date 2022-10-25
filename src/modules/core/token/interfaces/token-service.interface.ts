import { AccessTokenClaim } from 'src/dto/token/access-token-claim.dto';
import { User } from 'src/entities/user/user.entity';

export const TokenServiceKey = 'TokenService';

export interface ITokenService {
  createToken(id: string, churchId: number, user: User): Promise<{ accessToken: string }>;
  verifieToken(token: string): AccessTokenClaim;
  refresh(accessToken: string): Promise<{ accessToken: string }>;
  removeToken(accessToken: string): Promise<void>;
}
