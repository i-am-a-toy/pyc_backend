import { Cell } from 'src/entities/cell/cell.entity';

export class CellResponse {
  readonly id: number;
  readonly churchId: number;
  readonly familyId: number | null;
  readonly leaderId: number;
  readonly name: string;

  constructor(cell: Cell) {
    this.id = cell.id;
    this.churchId = cell.churchId;
    this.familyId = cell.groupId;
    this.leaderId = cell.leaderId;
    this.name = cell.name;
  }
}
