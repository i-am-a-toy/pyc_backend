import { NotFoundException } from '@nestjs/common';
import { TransformFnParams } from 'class-transformer';
import { Rank } from '../rank.type';
import { rankValidator } from '../rank.validator';

describe('rankValidator Test', () => {
  it('값으로 Null이 들어오는 경우', () => {
    //given
    const params = {
      value: null,
    } as TransformFnParams;

    //when
    const result = rankValidator(params);

    //then
    expect(result).toStrictEqual(Rank.NONE);
  });

  it('값으로 유효하지 않은 값이 들어오는 경우', () => {
    //given
    const params = {
      value: 'foobar',
    } as TransformFnParams;

    //when
    //then
    expect(() => rankValidator(params)).toThrowError(
      new NotFoundException(`foobar에 해당하는 Rank가 존재하지 않습니다.`),
    );
  });

  it('값으로 유효한 경우', () => {
    //given
    const params = {
      value: '입교',
    } as TransformFnParams;

    //when
    const result = rankValidator(params);

    //then
    expect(result).toStrictEqual(Rank.ADMISSION);
  });
});
