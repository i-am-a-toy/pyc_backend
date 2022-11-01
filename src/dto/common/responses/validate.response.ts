export class ValidateResponse {
  readonly result: boolean;

  constructor(exist: boolean) {
    this.result = exist;
  }
}
