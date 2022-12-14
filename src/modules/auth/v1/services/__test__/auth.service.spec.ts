import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { AccessTokenClaim } from 'src/dto/token/access-token-claim.dto';
import { TokenClaim } from 'src/dto/token/token-claim.dto';
import { Cell } from 'src/entities/cell/cell.entity';
import { Church } from 'src/entities/church/church.entity';
import { Family } from 'src/entities/group/group.entity';
import { RefreshToken } from 'src/entities/refresh-token/refresh-token.entity';
import { User } from 'src/entities/user/user.entity';
import { TokenServiceKey } from 'src/modules/core/token/interfaces/token-service.interface';
import { TokenService } from 'src/modules/core/token/services/token.service';
import { Gender } from 'src/types/gender/gender.type';
import { Rank } from 'src/types/rank/rank.type';
import { Role } from 'src/types/role/role.type';
import { mockChurchs } from 'src/utils/mocks/churches/mock';
import { getMockUser } from 'src/utils/mocks/users/mock';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { IAuthService } from '../../interfaces/auth-service.interface';
import { AuthService } from '../auth.service';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

describe('AuthService Test', () => {
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let service: IAuthService;

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
        TypeOrmModule.forFeature([RefreshToken, User]),
        JwtModule.register({
          secret: 'test',
          signOptions: {
            issuer: 'pyc',
          },
        }),
      ],
      providers: [
        {
          provide: TokenServiceKey,
          useClass: TokenService,
        },
        AuthService,
      ],
    }).compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    jwtService = moduleRef.get<JwtService>(JwtService);
    service = moduleRef.get<IAuthService>(AuthService);
  });

  afterEach(async () => {
    await dataSource.query('DROP TABLE IF EXISTS users CASCADE;');
    await dataSource.query('DROP TABLE IF EXISTS refresh_tokens CASCADE;');
    await dataSource.destroy();
  });

  it('Should be defined', () => {
    expect(container).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(service).toBeDefined();
  });

  it('Login Test - ????????? ????????? ????????? ???????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);

    const inputPassword = 'password';
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(inputPassword, salt);

    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.NEWBIE, Rank.INFANT_BAPTISM, Gender.MALE, null, hashedPassword),
    ]);

    //when
    //then
    await expect(service.login(userA.name, inputPassword)).rejects.toThrowError(
      new ForbiddenException('?????????, ????????? ???????????? ??? ??? ????????????.'),
    );
  });

  it('Login Test - ????????? ????????? ????????? ????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);

    const inputPassword = 'password';
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(inputPassword, salt);

    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null, hashedPassword),
    ]);

    //when
    //then
    await expect(service.login(userA.name, inputPassword)).rejects.toThrowError(
      new ForbiddenException('?????????, ????????? ???????????? ??? ??? ????????????.'),
    );
  });

  it('Login Test - ????????? ????????? ????????? ????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);

    const inputPassword = 'password';
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(inputPassword, salt);

    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null, hashedPassword),
    ]);

    //when
    //then
    await expect(service.login(userA.name, inputPassword)).rejects.toThrowError(
      new ForbiddenException('?????????, ????????? ???????????? ??? ??? ????????????.'),
    );
  });

  it('Login Test - ??????????????? ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);

    const originPassword = 'password';
    const inputPassword = 'foobar';
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(originPassword, salt);

    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null, hashedPassword),
    ]);

    //when
    //then
    await expect(service.login(userA.name, inputPassword)).rejects.toThrowError(
      new UnauthorizedException('??????????????? ????????????.'),
    );
  });

  it('Login Test - ???????????? ??????????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);

    const originPassword = 'password';
    const inputPassword = 'password';
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(originPassword, salt);

    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null, hashedPassword),
    ]);

    //when
    const result = await service.login(userA.name, inputPassword);

    //then
    const { accessToken } = result;
    expect(() => jwtService.verify<AccessTokenClaim>(accessToken)).not.toThrowError();
  });

  it('Logout Test - ????????? ???????????? ?????? ??????', async () => {
    //given
    const token = 'foobar';

    //when
    //then
    await expect(service.logout(token)).rejects.toThrowError(
      new UnauthorizedException('?????? ????????? ???????????? ?????? ???????????? ????????? ?????????????????????.'),
    );
  });

  it('Logout Test - ????????? ???????????? ??????????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);

    const originPassword = 'password';
    const inputPassword = 'password';
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(originPassword, salt);

    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null, hashedPassword),
    ]);
    const result = await service.login(userA.name, inputPassword);

    //when
    //then
    await expect(service.logout(result.accessToken)).resolves.not.toThrowError();
  });

  it('Refresh Test - ????????? ???????????? ?????? ??????', async () => {
    //given
    const token = 'foobar';

    //when
    //then
    await expect(service.refresh(token)).rejects.toThrowError(
      new UnauthorizedException('?????? ????????? ???????????? ?????? ????????? ?????????????????????.'),
    );
  });

  it('Logout Test - ????????? ???????????? ??????????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);

    const originPassword = 'password';
    const inputPassword = 'password';
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(originPassword, salt);

    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null, hashedPassword),
    ]);
    const result = await service.login(userA.name, inputPassword);
    const prevTokenCliam = jwtService.verify<AccessTokenClaim>(result.accessToken);

    console.log('start sleep');
    await sleep(1000);
    console.log('end sleep');

    //when
    const newToken = await service.refresh(result.accessToken);

    //then
    const newTokenCliam = jwtService.verify<AccessTokenClaim>(newToken.accessToken);
    expect(prevTokenCliam.id).toEqual(newTokenCliam.id);
    expect(new Date(prevTokenCliam.iat) < new Date(newTokenCliam.iat)).toBe(true);
  });

  it('ChagePassword Test - Target??? ???????????? ?????? ??????', async () => {
    //given
    //when
    //then
    await expect(service.chagePassword(1, 'prev', 'new')).rejects.toThrowError(
      new EntityNotFoundError(User, { id: 1 }),
    );
  });

  it('ChangePassword Test - ???????????? ????????? ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.NEWBIE, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);

    //when
    //then
    await expect(service.chagePassword(userA.id, 'prev', 'new')).rejects.toThrowError(
      new ForbiddenException('?????????, ????????? ??????????????? ????????? ??? ????????????.'),
    );
  });

  it('ChangePassword Test - ????????? ????????? ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);
    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.MEMBER, Rank.INFANT_BAPTISM, Gender.MALE, null),
    ]);

    //when
    //then
    await expect(service.chagePassword(userA.id, 'prev', 'new')).rejects.toThrowError(
      new ForbiddenException('?????????, ????????? ??????????????? ????????? ??? ????????????.'),
    );
  });

  it('ChagePassword Test - ?????? ??????????????? ?????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);

    const originPassword = 'password';
    const intputPassword = 'foobar';
    const newPassword = 'newPassword';
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(originPassword, salt);

    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null, hashedPassword),
    ]);

    //when
    //then
    await expect(service.chagePassword(userA.id, intputPassword, newPassword)).rejects.toThrowError(
      new UnauthorizedException('????????? ??????????????? ?????? ??????????????? ????????????.'),
    );
  });

  it('ChagePassword Test - ??????????????? ??????', async () => {
    //given
    const [churchA] = await dataSource.manager.save(Church, mockChurchs);

    const originPassword = 'password';
    const newPassword = 'newPassword';
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(originPassword, salt);

    const [userA] = await dataSource.manager.save(User, [
      getMockUser('userA', Role.LEADER, Rank.INFANT_BAPTISM, Gender.MALE, null, hashedPassword),
    ]);

    //when
    await expect(service.chagePassword(userA.id, originPassword, newPassword)).resolves.not.toThrowError();

    //then
    const updatedUser = await dataSource.manager.findOneByOrFail(User, { id: userA.id });
    expect(compareSync(newPassword, updatedUser.password!)).toBe(true);
  });

  it('isValidated Test - ????????? ???????????? ?????? ??????', () => {
    //givne
    const token = '';

    //when
    const validateResult = service.isValidated(token);

    //the
    expect(validateResult.result).toBe(false);
  });

  it('isValidatd Test - ????????? ??????', () => {
    //given
    const claim = new TokenClaim('test', 1, 1, 'foobar', 'foobar');
    const token = jwtService.sign(claim.toPlain(), { expiresIn: '1ms' });

    //when
    const validateResult = service.isValidated(token);

    //then
    expect(validateResult.result).toBe(false);
  });

  it('isValidatd Test - ????????? ?????? ??????', () => {
    //given
    const claim = new TokenClaim('test', 1, 1, 'foobar', 'foobar');
    const token = jwtService.sign(claim.toPlain(), { secret: 'foobar' });

    //when
    const validateResult = service.isValidated(token);

    //then
    expect(validateResult.result).toBe(false);
  });

  it('isValidatd Test - ????????? ??????', () => {
    //given
    const claim = new TokenClaim('test', 1, 1, 'foobar', 'foobar');
    const token = jwtService.sign(claim.toPlain());

    //when
    const validateResult = service.isValidated(token);

    //then
    expect(validateResult.result).toBe(true);
  });
});
