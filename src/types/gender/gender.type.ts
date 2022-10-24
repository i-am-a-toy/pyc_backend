import { Enum, EnumType } from 'ts-jenum';

@Enum('gender')
export class Gender extends EnumType<Gender>() {
  static readonly MALE = new Gender(1, 'MALE', '남성');
  static readonly FEMALE = new Gender(2, 'FEMALE', '여성');
  static readonly NONE = new Gender(3, 'NONE', '선택안함');

  private constructor(
    private readonly _code: number,
    private readonly _gender: string,
    private readonly _name: string,
  ) {
    super();
  }

  get code(): number {
    return this._code;
  }

  get gender(): string {
    return this._gender;
  }

  get name(): string {
    return this._name;
  }

  static findByName(name: string): Gender | undefined {
    return Gender.values().find((g) => g.name === name);
  }
}
