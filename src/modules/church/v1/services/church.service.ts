import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChurchRequest } from 'src/dto/church/requests/create-church.request';
import { UpdateChurchRequest } from 'src/dto/church/requests/update-church-request';
import { ChurchListResponse } from 'src/dto/church/responses/church-list.response';
import { ChurchResponse } from 'src/dto/church/responses/church.response';
import { ValidateResponse } from 'src/dto/common/responses/validate.response';
import { Church } from 'src/entities/church/church.entity';
import { Address } from 'src/entities/embedded/address.entity';
import { Repository } from 'typeorm';
import { IChurchService } from '../interfaces/church-service.interface';

@Injectable()
export class ChurchService implements IChurchService {
  private readonly logger: Logger = new Logger('ChurchService');
  constructor(@InjectRepository(Church) private readonly repository: Repository<Church>) {}

  async save(req: CreateChurchRequest): Promise<ChurchResponse> {
    const saved = await this.repository.save(req.toEntity());
    return new ChurchResponse(saved);
  }

  async findOneById(id: number): Promise<ChurchResponse> {
    const selected = await this.repository.findOneByOrFail({ id });
    return new ChurchResponse(selected);
  }

  async findAll(offset: number, limit: number): Promise<ChurchListResponse> {
    const [rows, count] = await this.repository.findAndCount({
      skip: offset,
      take: limit,
    });
    return new ChurchListResponse(rows, count);
  }

  async isExsitName(name: string): Promise<ValidateResponse> {
    const selected = await this.repository.findOneBy({ name });
    return new ValidateResponse(selected ? true : false);
  }

  async update(id: number, req: UpdateChurchRequest): Promise<void> {
    const updateResult = await this.repository.update(id, {
      name: req.name,
      address: new Address(req.zipCode, req.address),
      managerName: req.managerName,
      managerContact: req.managerContact,
    });
    this.logger.log(`Updated Church targetId: ${id}, afftedRow: ${updateResult.affected}`);
  }

  async delete(id: number): Promise<void> {
    const deleteResult = await this.repository.delete(id);
    this.logger.log(`Deleted Church targetId: ${id}, afftedRow: ${deleteResult.affected}`);
  }
}
