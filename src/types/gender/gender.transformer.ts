import { ValueTransformer } from 'typeorm';
import { Gender } from './gender.type';

export class GenderTransformer implements ValueTransformer {
  to(value: Gender): string {
    return value.gender;
  }

  from(gender: string): Gender | null {
    if (!gender) return null;
    return Gender.valueByName(gender);
  }
}
