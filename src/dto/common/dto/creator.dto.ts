import { Creator } from 'src/entities/embedded/creator.entity';
import { User } from 'src/entities/user/user.entity';

export class CreatorDto {
  readonly name: string;
  readonly role: string;
  readonly image: string | null;

  constructor(user: User, creator: Creator) {
    this.name = user?.name ?? creator.name;
    this.role = user?.role.name ?? creator.role.name;
    this.image = user?.image ?? null;
  }
}
