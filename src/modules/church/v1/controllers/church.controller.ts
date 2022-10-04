import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateChurchRequest } from 'src/dto/church/requests/create-church.request';
import { UpdateChurchRequest } from 'src/dto/church/requests/update-church-request';
import { ChurchListResponse } from 'src/dto/church/responses/church-list.response';
import { ChurchResponse } from 'src/dto/church/responses/church.response';
import { PaginationQuery } from 'src/dto/common/requests/pagination.query';
import { ValidateExistResponse } from 'src/dto/common/responses/validate-exist.response';
import { IChurchService } from '../interfaces/church-service.interface';

@Controller('church')
export class ChurchController {
  constructor(@Inject('churchService') private readonly churchService: IChurchService) {}

  @Post()
  async joinChurch(@Body() req: CreateChurchRequest): Promise<ChurchResponse> {
    return this.churchService.save(req);
  }

  @Get('/:id')
  async getChurch(@Param('id', ParseIntPipe) id: number): Promise<ChurchResponse> {
    return this.churchService.findOneById(id);
  }

  @Get()
  async getChurchList(@Query() query: PaginationQuery): Promise<ChurchListResponse> {
    return this.churchService.findAll(query.offset, query.limit);
  }

  @Get('/validate/name/:name')
  async validateExistName(@Param('name') name: string): Promise<ValidateExistResponse> {
    return this.churchService.isExsitName(name);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateChurchInfo(@Param('id', ParseIntPipe) id: number, @Body() req: UpdateChurchRequest): Promise<void> {
    await this.churchService.update(id, req);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteChurchInfo(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.churchService.delete(id);
  }
}
