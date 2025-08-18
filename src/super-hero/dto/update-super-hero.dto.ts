/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
import { CreateHeroDto } from './create-super-hero.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateHeroDto extends PartialType(CreateHeroDto) {
  @IsOptional()
  @IsNumber({}, { each: true })
  deleteImagesIds?: number[];
}
