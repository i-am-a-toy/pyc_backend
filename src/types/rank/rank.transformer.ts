import { ValueTransformer } from 'typeorm';
import { Rank } from './rank.type';

export class RankTransformer implements ValueTransformer {
  to(value: Rank): string {
    return value.rank;
  }

  from(value: string): Rank | null {
    if (!value) return null;
    return Rank.valueByName(value);
  }
}
