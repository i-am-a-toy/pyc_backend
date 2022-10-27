import { TokenResponse } from 'src/dto/auth/responses/login.response';

export const AuthServiceKey = 'AuthService';

export interface IAuthService {
  login(name: string, password: string): Promise<TokenResponse>;
  logout(accessToken: string): Promise<void>;
  refresh(accessToken: string): Promise<TokenResponse>;
  chagePassword(id: number, prevPassword: string, newPassword: string): Promise<void>;
}
