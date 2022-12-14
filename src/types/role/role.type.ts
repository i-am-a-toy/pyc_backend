import { Enum, EnumType } from 'ts-jenum';

@Enum('role')
export class Role extends EnumType<Role>() {
  static readonly ADMIN = new Role(0, 'ADMIN', '관리자');
  static readonly PASTOR = new Role(1, 'PASTOR', '목사님');
  static readonly PASTOR_WIFE = new Role(2, 'PASTOR_WIFE', '사모님');
  static readonly JUNIOR_PASTOR = new Role(3, 'JUNIOR_PASTOR', '전도사님');
  static readonly GROUP_LEADER = new Role(4, 'GROUP_LEADER', '팸장');
  static readonly NEWBIE_TEAM_LEADER = new Role(5, 'NEWBIE_TEAM_LEADER', '새친구팀장');
  static readonly LEADER = new Role(6, 'LEADER', '셀리더');
  static readonly MEMBER = new Role(7, 'MEMBER', '셀원');
  static readonly NEWBIE = new Role(8, 'NEWBIE', '새신자');

  private constructor(private readonly _code: number, private readonly _role: string, private readonly _name: string) {
    super();
  }

  get code(): number {
    return this._code;
  }

  get role(): string {
    return this._role;
  }

  get name(): string {
    return this._name;
  }

  static findByName(name: string): Role | undefined {
    return Role.values().find((u) => u.name === name);
  }

  isAbleFamilyLeader(): boolean {
    return this.code < Role.MEMBER.code;
  }

  isAbleLeader(): boolean {
    return this.code < Role.NEWBIE.code;
  }

  isLeader(): boolean {
    return this.code < Role.MEMBER.code;
  }
}
