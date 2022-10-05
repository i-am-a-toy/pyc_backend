import { NotFoundException } from '@nestjs/common';
import { TransformFnParams } from 'class-transformer';
import { Role } from './role.type';

export const roleValidator = (params: TransformFnParams) => {
  const { value } = params;

  const selectedUserRole = Role.findByName(value);
  if (!selectedUserRole) {
    throw new NotFoundException(`${value}에 해당하는 역할이 존재하지 않습니다.`);
  }
  return selectedUserRole;
};
