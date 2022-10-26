export class LoginResponse {
  constructor(readonly accessToken: string) {
    this.accessToken = accessToken;
  }
}
