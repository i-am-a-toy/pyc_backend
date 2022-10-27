import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn({ type: 'integer', unsigned: true })
  id: number;

  @Column({ type: 'integer', nullable: false })
  churchId: number;

  @Column({ type: 'varchar', nullable: false, comment: 'Access Token의 고유 Id' })
  tokenId: string;

  @Column({ type: 'integer', name: 'user_id', nullable: false, comment: 'user의 Id' })
  userId: number;

  @ManyToOne(() => User, { cascade: ['remove'] })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'varchar', nullable: false, comment: 'user의 Refresh 토큰' })
  refreshToken: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: false, comment: 'Refresh Token의 생성일' })
  createdAt: Date;

  static of(churchId: number, user: User, accessTokenId: string, token: string): RefreshToken {
    const refreshToken = new RefreshToken();
    refreshToken.churchId = churchId;
    refreshToken.tokenId = accessTokenId;
    refreshToken.user = user;
    refreshToken.refreshToken = token;
    return refreshToken;
  }
}
