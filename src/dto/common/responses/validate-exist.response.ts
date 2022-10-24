export class ValidateExistResponse {
  readonly isExist: boolean;

  constructor(exist: boolean) {
    this.isExist = exist;
  }
}
