import { UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AccessTokenClaim } from 'src/dto/token/access-token-claim.dto';
import { TokenClaim } from 'src/dto/token/token-claim.dto';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { Family } from 'src/entities/group/group.entity';
import { RefreshToken } from 'src/entities/refresh-token/refresh-token.entity';
import { User } from 'src/entities/user/user.entity';
import { Gender } from 'src/types/gender/gender.type';
import { Rank } from 'src/types/rank/rank.type';
import { Role } from 'src/types/role/role.type';
import { mockChurchs } from 'src/utils/mocks/churches/mock';
import { getMockUser } from 'src/utils/mocks/users/mock';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { ITokenService } from '../../interfaces/token-service.interface';
import { TokenService } from '../token.service';

describe('nestjs/jwt를 이용한 jwt 생성 Test', () => {
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test',
          signOptions: {
            issuer: 'pyc',
          },
        }),
      ],
    }).compile();

    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  it('tokenClaim을 이용하여 Token 생성 및 검증', () => {
    //given
    const claim = new TokenClaim('test', 1, 1, 'foobar', 'foobar');

    //when
    const token = jwtService.sign(claim.toPlain(), { expiresIn: 60 * 60 });
    const verified = plainToInstance(AccessTokenClaim, jwtService.verify<AccessTokenClaim>(token));

    //then
    expect(verified.id).toBe('test');
    expect(verified.churchId).toBe(1);
    expect(verified.userId).toBe(1);
    expect(verified.name).toBe('foobar');
    expect(verified.roleName).toBe('foobar');
    expect(verified.iss).toBe('pyc');
  });

  it('token이 만료되었을 때', () => {
    //given
    const claim = new TokenClaim('test', 1, 1, 'foobar', 'foobar');

    //when
    const token = jwtService.sign(claim.toPlain(), { expiresIn: '1ms' });

    //when
    //then
    expect(() => jwtService.verify<TokenClaim>(token)).toThrowError(TokenExpiredError);
  });

  it('token의 secret이 다를 경우', () => {
    //given
    const claim = new TokenClaim('test', 1, 1, 'foobar', 'foobar');

    //when
    const token = jwtService.sign(claim.toPlain(), { expiresIn: '1ms' });

    //when
    //then
    expect(() => jwtService.verify<TokenClaim>(token, { secret: '123' })).toThrowError(
      new JsonWebTokenError('invalid signature'),
    );
  });
});

describe('Token Service Test', () => {
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let tokenService: ITokenService;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().withExposedPorts(5432).start();
  });

  afterAll(async () => {
    await container.stop();
  });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: container.getHost(),
          port: container.getPort(),
          username: container.getUsername(),
          password: container.getPassword(),
          database: container.getDatabase(),
          synchronize: true,
          entities: [RefreshToken, Church, Family, Cell, User],
        }),
        TypeOrmModule.forFeature([RefreshToken]),
        JwtModule.register({
          secret: 'test',
          signOptions: {
            issuer: 'pyc',
          },
        }),
      ],
      providers: [TokenService],
    }).compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    jwtService = moduleRef.get<JwtService>(JwtService);
    tokenService = moduleRef.get<ITokenService>(TokenService);
  });

  afterEach(async () => {
    await dataSource.query('DROP TABLE IF EXISTS users CASCADE;');
    await dataSource.query('DROP TABLE IF EXISTS refresh_tokens CASCADE;');
    await dataSource.destroy();
  });

  it('Should be defined', () => {
    expect(dataSource).toBeDefined();
    expect(tokenService).toBeDefined();
  });

  it('create Token Test', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);

    //when
    const token = await tokenService.createToken(churchA.id, 'test', userA);

    //then
    const verified = jwtService.verify<AccessTokenClaim>(token.accessToken);
    expect(verified.id).toBe('test');
    expect(verified.churchId).toBe(1);
    expect(verified.userId).toBe(1);
    expect(verified.name).toBe('userA');
    expect(verified.roleName).toBe('MEMBER');
    expect(verified.iss).toBe('pyc');
  });

  it('verified Token Test - 만료되었을 경우', () => {
    //given
    const claim = new TokenClaim('test', 1, 1, 'foobar', 'foobar');
    const token = jwtService.sign(claim.toPlain(), { expiresIn: '1ms' });

    //when
    //then
    expect(() => tokenService.verifieToken(token)).toThrowError(
      new UnauthorizedException('인증 정보가 유효하지 않습니다.'),
    );
  });

  it('verified Token Test - 서명이 다를 때', () => {
    //given
    const claim = new TokenClaim('test', 1, 1, 'foobar', 'foobar');
    const token = jwtService.sign(claim.toPlain(), { expiresIn: '1 days', secret: 'foobar' });

    //when
    //then
    expect(() => tokenService.verifieToken(token)).toThrowError(
      new UnauthorizedException('인증 정보가 유효하지 않습니다.'),
    );
  });

  it('verified Token Test - 정상적으로 검증', () => {
    //given
    const claim = new TokenClaim('test', 1, 1, 'foobar', 'foobar');
    const token = jwtService.sign(claim.toPlain(), { expiresIn: '1 days', secret: 'test' });

    //when
    const verified = tokenService.verifieToken(token);

    //then
    expect(verified.id).toBe('test');
    expect(verified.churchId).toBe(1);
    expect(verified.userId).toBe(1);
    expect(verified.name).toBe('foobar');
    expect(verified.roleName).toBe('foobar');
    expect(verified.iss).toBe('pyc');
  });

  it('refresh Token Test - 검증에 실패하는 경우', async () => {
    //given
    const claim = new TokenClaim('test', 1, 1, 'foobar', 'foobar');
    const token = jwtService.sign(claim.toPlain(), { expiresIn: '1 days', secret: 'foobar' });

    //when
    //then
    await expect(tokenService.refresh(token)).rejects.toThrowError(
      new UnauthorizedException('인증 정보가 유효하지 않아 갱신에 실패하였습니다.'),
    );
  });

  it('refresh Token Test - Refresh Token이 존재하지 않는 경우', async () => {
    //given
    const claim = new TokenClaim('test', 1, 1, 'foobar', 'foobar');
    const token = jwtService.sign(claim.toPlain(), { expiresIn: '1 days', secret: 'test' });

    //when
    //then
    await expect(tokenService.refresh(token)).rejects.toThrowError(
      new UnauthorizedException('인증 정보가 유효하지 않아 갱신에 실패하였습니다.'),
    );
  });

  it('refresh Token Test - 정상적으로 Refresh 되는 경우', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);

    const token = await tokenService.createToken(churchA.id, 'test', userA);

    //when
    const refreshed = await tokenService.refresh(token.accessToken);

    //then
    const verified = jwtService.verify<AccessTokenClaim>(refreshed.accessToken);
    expect(verified.id).toBe('test');
    expect(verified.churchId).toBe(1);
    expect(verified.userId).toBe(1);
    expect(verified.name).toBe('userA');
    expect(verified.roleName).toBe('MEMBER');
    expect(verified.iss).toBe('pyc');
  });

  it('removeRefreshToken Test - 토큰이 유효하지 않는 경우', async () => {
    //given
    const claim = new TokenClaim('test', 1, 1, 'foobar', 'foobar');
    const token = jwtService.sign(claim.toPlain(), { expiresIn: '1 days', secret: 'foobar' });

    //when
    //then
    await expect(tokenService.removeToken(token)).rejects.toThrowError(
      new UnauthorizedException('인증 정보가 유효하지 않아 인증정보 삭제에 실패하였습니다.'),
    );
  });

  it('removeRefreshToken Test - 존재하지 않는 경우', async () => {
    //given
    const claim = new TokenClaim('test', 1, 1, 'foobar', 'foobar');
    const token = jwtService.sign(claim.toPlain(), { expiresIn: '1 days', secret: 'test' });

    //when
    //then
    await expect(tokenService.removeToken(token)).resolves.not.toThrowError();
  });

  it('removeRefreshToken Test - 정상적으로 삭제', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);

    const token = await tokenService.createToken(churchA.id, 'test', userA);

    //when
    await tokenService.removeToken(token.accessToken);

    //then
    const result = jwtService.verify(token.accessToken, { ignoreExpiration: true });
    const removed = await dataSource
      .getRepository(RefreshToken)
      .findOneBy({ churchId: churchA.id, userId: userA.id, tokenId: result.id });

    expect(removed).toBeNull();
  });
});
