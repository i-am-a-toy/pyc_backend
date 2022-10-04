import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseTimeEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @CreateDateColumn({ nullable: false, type: 'timestamptz', comment: '데이터 생성 일자' })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false, type: 'timestamptz', comment: '데이터 업데이트 일자' })
  updatedAt: Date;
}
