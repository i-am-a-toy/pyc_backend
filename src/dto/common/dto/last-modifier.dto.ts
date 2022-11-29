import { LastModifier } from 'src/entities/embedded/last-modifier.entity';
import { User } from 'src/entities/user/user.entity';

export class LastModifierDto {
  readonly name: string;
  readonly role: string;
  readonly image: string | null;

  constructor(user: User, lastModifier: LastModifier) {
    this.name = user?.name ?? lastModifier.name;
    this.role = user?.role.name ?? lastModifier.role.name;
    this.image = user?.image ?? null;
  }
}
