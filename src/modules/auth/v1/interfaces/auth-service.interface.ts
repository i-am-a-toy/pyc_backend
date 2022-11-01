import { TokenResponse } from 'src/dto/auth/responses/login.response';
import { ValidateResponse } from 'src/dto/common/responses/validate.response';

export const AuthServiceKey = 'AuthService';

export interface IAuthService {
  isValidated(accessToken: string): ValidateResponse;
  login(name: string, password: string): Promise<TokenResponse>;
  logout(accessToken: string): Promise<void>;
  refresh(accessToken: string): Promise<TokenResponse>;
  chagePassword(id: number, prevPassword: string, newPassword: string): Promise<void>;
}
