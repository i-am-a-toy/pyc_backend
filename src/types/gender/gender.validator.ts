import { NotFoundException } from '@nestjs/common';
import { TransformFnParams } from 'class-transformer';
import { Gender } from './gender.type';

export const genderValidator = (params: TransformFnParams) => {
  const { value } = params;
  if (!value) return Gender.NONE;

  const selectedGender = Gender.findByName(value);
  if (!selectedGender) {
    throw new NotFoundException(`${value}에 해당하는 성별이 존재하지 않습니다.`);
  }
  return selectedGender;
};
