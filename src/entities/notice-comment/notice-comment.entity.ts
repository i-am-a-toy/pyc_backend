import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseTimeEntity } from '../base-time.entity';
import { Church } from '../church/church.entity';
import { Notice } from '../notice/notice.entity';

@Entity({ name: 'notice_comments' })
export class NoticeComment extends BaseTimeEntity {
  @Column({ name: 'church_id', nullable: false, type: 'integer', comment: '사용자가 속한 셀 교회' })
  churchId!: number;

  @ManyToOne(() => Church)
  @JoinColumn({ name: 'church_id' })
  church!: Church;

  @Column({ name: 'notice_id', nullable: false, type: 'integer', comment: '공지사항 ID' })
  noticeId!: number;

  @ManyToOne(() => Notice)
  @JoinColumn({ name: 'notice_id' })
  notice!: Notice;

  @Column({ name: 'parent_comment_id', nullable: true, type: 'integer', comment: '부모 댓글 ID' })
  parentCommentId: number | null;

  @ManyToOne(() => NoticeComment)
  @JoinColumn({ name: 'parent_comment_id' })
  parent: NoticeComment | null;

  @OneToMany(() => NoticeComment, (comment) => comment.parent)
  children: NoticeComment[];

  @Column({ type: 'varchar', nullable: false, comment: '공지사항에 대한 댓글' })
  comment: string;

  @Column({ type: 'integer', nullable: true, comment: '그룹 안에서의 댓글 순서' })
  groupSortNumber: number | null;

  static of(
    church: Church,
    notice: Notice,
    comment: string,
    groupSortNumber?: number,
    parent?: NoticeComment,
  ): NoticeComment {
    const e = new NoticeComment();
    e.church = church;
    e.notice = notice;
    e.comment = comment;
    if (groupSortNumber) e.groupSortNumber = groupSortNumber;
    if (parent) e.parent = parent;
    return e;
  }

  changeComment(comment: string): void {
    this.comment = comment;
  }
}
