import { BadRequestException } from '@nestjs/common';
import { TransformFnParams } from 'class-transformer';
import { numberTransfrom } from './number.transfrom';

describe('NumberTransform Test', () => {
  it('param이 Number가 아닌 경우', () => {
    //given
    const param = { value: 'leewoooo123', key: 'offset' } as TransformFnParams;

    //when
    //then
    expect(() => numberTransfrom(param)).toThrowError(new BadRequestException(`offset must be Number`));
  });

  it('param이 Undefind일 경우', () => {
    //given
    const param = { value: undefined, key: 'offset' } as TransformFnParams;

    //when
    //then
    expect(() => numberTransfrom(param)).toThrowError(new BadRequestException(`offset must be Number`));
  });

  it('param이 Number String인 경우', () => {
    //given
    const param = { value: '1234', key: 'offset' } as TransformFnParams;

    //when
    const result = numberTransfrom(param);

    //then
    expect(result).toBe(1234);
  });

  it('param이 Number인 경우', () => {
    //given
    const param = { value: 1234, key: 'offset' } as TransformFnParams;

    //when
    const result = numberTransfrom(param);

    //then
    expect(result).toBe(1234);
  });
});
