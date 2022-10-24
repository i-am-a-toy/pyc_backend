import { NotFoundException } from '@nestjs/common';
import { TransformFnParams } from 'class-transformer';
import { Gender } from '../gender.type';
import { genderValidator } from '../gender.validator';

describe('genderValidator Test', () => {
  it('값으로 Null이 들어오는 경우', () => {
    //given
    const params = {
      value: null,
    } as TransformFnParams;

    //when
    const result = genderValidator(params);

    //then
    expect(result).toStrictEqual(Gender.NONE);
  });

  it('값으로 유효하지 않은 값이 들어오는 경우', () => {
    //given
    const params = {
      value: 'foobar',
    } as TransformFnParams;

    //when
    //then
    expect(() => genderValidator(params)).toThrowError(
      new NotFoundException(`foobar에 해당하는 성별이 존재하지 않습니다.`),
    );
  });

  it('값으로 유효한 경우', () => {
    //given
    const params = {
      value: '남성',
    } as TransformFnParams;

    //when
    const result = genderValidator(params);

    //then
    expect(result).toStrictEqual(Gender.MALE);
  });
});
