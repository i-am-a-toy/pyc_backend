import { ValueTransformer } from 'typeorm';
import { Role } from './role.type';

export class RoleTransformer implements ValueTransformer {
  to(value: Role): string {
    return value.enumName;
  }

  from(value: string): Role | null {
    if (!value) return null;
    return Role.valueByName(value);
  }
}
