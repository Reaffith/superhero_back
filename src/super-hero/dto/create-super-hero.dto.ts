/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateHeroDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  real_name: string;

  @IsString()
  @IsNotEmpty()
  origin_description: string;

  @ArrayNotEmpty()
  @IsString({ each: true })
  superpowers: string[];

  @IsString()
  @IsNotEmpty()
  catch_phrase: string;
}
