import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { SuperHeroService } from './super-hero.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateHeroDto } from './dto/create-super-hero.dto';
import { UpdateHeroDto } from './dto/update-super-hero.dto';

@Controller('superhero')
export class SuperHeroController {
  constructor(private readonly service: SuperHeroService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() createHeroDto: CreateHeroDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const result = await this.service.create(createHeroDto, files);

    return result;
  }

  @Get()
  async getAll(@Query('page') page?: string) {
    if (page && (isNaN(+page) || +page < 1)) {
      throw new BadRequestException('Page Should Be Numeric');
    }

    const heroes = page
      ? await this.service.getAll(+page)
      : await this.service.getAll();

    return heroes;
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const hero = await this.service.getOne(id);

    return hero;
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('newImages', 10))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHeroDto,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    const updatedHero = await this.service.update(id, updateDto, files);

    return updatedHero;
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.service.delete(id);

    return result;
  }

  @Get('pages')
  async getPages() {
    return await this.service.getPages();
  }
}
