import { Enum, EnumType } from 'ts-jenum';

@Enum('rank')
export class Rank extends EnumType<Rank>() {
  static readonly INCOMING = new Rank(1, 'INCOMING', '원입');
  static readonly INFANT_BAPTISM = new Rank(2, 'INFANT_BAPTISM', '유아세례');
  static readonly ADMISSION = new Rank(3, 'ADMISSION', '입교');
  static readonly NONE = new Rank(4, 'NONE', '선택안함');

  private constructor(private readonly _code: number, private readonly _rank: string, private readonly _name: string) {
    super();
  }

  get code(): number {
    return this._code;
  }

  get rank(): string {
    return this._rank;
  }

  get name(): string {
    return this._name;
  }

  static findByName(name: string): Rank | undefined {
    return Rank.values().find((r) => r.name === name);
  }
}
