import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimeEntity } from '../base-time.entity';
import { Church } from '../church/church.entity';
import { Creator } from '../embedded/creator.entity';
import { LastModifier } from '../embedded/last-modifier.entity';
import { Notice } from '../notice/notice.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'notice_comments' })
export class NoticeComment extends BaseTimeEntity {
  @Column({ name: 'church_id', nullable: false, type: 'integer', comment: '사용자가 속한 셀 교회' })
  churchId!: number;

  @ManyToOne(() => Church)
  @JoinColumn({ name: 'church_id' })
  church!: Church;

  @Column({ type: 'integer', name: 'notice_id', nullable: false, comment: '공지사항 ID' })
  noticeId!: number;

  @ManyToOne(() => Notice)
  @JoinColumn({ name: 'notice_id' })
  notice!: Notice;

  @Column({ type: 'integer', name: 'parent_comment_id', nullable: true, comment: '부모 댓글 ID' })
  parentCommentId: number | null;

  @ManyToOne(() => NoticeComment)
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: NoticeComment | null;

  @Column({ type: 'varchar', nullable: false, comment: '댓글 내용' })
  comment!: string;

  @Column({ type: 'integer', nullable: false, comment: '댓글 그룹의 정렬 순서' })
  groupSortNumber!: number;

  @Column(() => Creator, { prefix: false })
  creator!: Creator;

  @Column({ nullable: false, name: 'created_by', type: 'integer', comment: '데이터 생성자' })
  createdBy!: number;

  @Column(() => LastModifier, { prefix: false })
  lastModifier!: LastModifier;

  @Column({ nullable: false, name: 'last_modified_by', type: 'integer', comment: '데이터 수정자' })
  lastModifiedBy!: number;

  cUser: User;
  mUser: User;

  static of(
    church: Church,
    notice: Notice,
    user: User,
    comment: string,
    groupSortNumber: number,
    options?: { parentComment: NoticeComment },
  ): NoticeComment {
    const { id, name, role } = user;
    const e = new NoticeComment();
    e.church = church;
    e.notice = notice;
    e.comment = comment;
    e.groupSortNumber = groupSortNumber;
    e.creator = new Creator(name, role);
    e.createdBy = id;
    e.lastModifier = new LastModifier(name, role);
    e.lastModifiedBy = id;
    e.parentComment = options?.parentComment ?? null;
    return e;
  }
}
