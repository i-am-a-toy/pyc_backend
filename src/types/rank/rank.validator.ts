import { NotFoundException } from '@nestjs/common';
import { TransformFnParams } from 'class-transformer';
import { Rank } from './rank.type';

export const rankValidator = (params: TransformFnParams) => {
  const { value } = params;

  const selectedRank = Rank.findByName(value);
  if (!selectedRank) {
    throw new NotFoundException(`${value}에 해당하는 Rank가 존재하지 않습니다.`);
  }
  return selectedRank;
};
