import { LoginResponse } from 'src/dto/auth/responses/login.response';

export const AuthServiceKey = 'AuthService';

export interface IAuthService {
  login(churchId: number, name: string, password: string): Promise<LoginResponse>;
  logout(accessToken: string): Promise<void>;
  refresh(accessToken: string): Promise<LoginResponse>;
  chagePassword(id: number, prevPassword: string, newPassword: string): Promise<void>;
}
