import { plainToInstance } from 'class-transformer';
import { CreateChurchRequest } from 'src/dto/church/requests/create-church.request';
import { UpdateChurchRequest } from 'src/dto/church/requests/update-church-request';
import { Church } from 'src/entities/church/church.entity';
import { Address } from 'src/entities/embedded/address.entity';

export const mockCreateChurchRequest: CreateChurchRequest = plainToInstance(CreateChurchRequest, {
  name: 'churchA',
  zipCode: '11111',
  address: '서울시 구로구',
  managerName: 'lee',
  managerContact: '01011111111',
});

export const mockUpdateChurchRequest: UpdateChurchRequest = plainToInstance(UpdateChurchRequest, {
  name: 'churchA',
  zipCode: '99999',
  address: '서울시 양천구',
  managerName: 'lim',
  managerContact: '01099999999',
});

export const mockChurchs: Church[] = [
  Church.of('churchA', new Address('11111', '서울시 구로구'), 'lee', '01011111111'),
  Church.of('churchB', new Address('22222', '서울시 영등포구'), 'kim', '01022222222'),
  Church.of('churchC', new Address('33333', '서울시 금천구'), 'park', '01033333333'),
  Church.of('churchD', new Address('44444', '서울시 양천구'), 'song', '01044444444'),
  Church.of('churchE', new Address('55555', '서울시 노원구'), 'go', '01055555555'),
  Church.of('churchF', new Address('66666', '서울시 관악구'), 'na', '01066666666'),
];
