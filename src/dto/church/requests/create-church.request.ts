import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { Church } from 'src/entities/church/church.entity';
import { Address } from 'src/entities/embedded/address.entity';

export class CreateChurchRequest {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumberString()
  readonly zipCode: string;

  @IsString()
  readonly address: string;

  @IsString()
  @IsNotEmpty()
  readonly managerName: string;

  @IsString()
  @IsNotEmpty()
  readonly managerContact: string;

  toEntity(): Church {
    return Church.of(this.name, new Address(this.zipCode, this.address), this.managerName, this.managerContact);
  }
}
