import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHeroDto } from './dto/create-super-hero.dto';
import { UpdateHeroDto } from './dto/update-super-hero.dto';

@Injectable()
export class SuperHeroService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(page?: number) {
    if (!page) {
      const result = await this.prisma.superHero.findMany({
        select: {
          id: true,
          nickname: true,
          real_name: true,
          origin_description: true,
          superpowers: true,
          catch_phrase: true,
          images: {
            select: {
              id: true,
              mimeType: true,
              data: true,
            },
            take: 1,
          },
        },
      });

      return result.map((hero) => ({
        ...hero,
        images: hero.images.map((image) => ({
          ...image,
          data: `data:${image.mimeType};base64,${Buffer.from(image.data).toString('base64')}`,
        })),
      }));
    } else {
      const take = 5;
      const skip = (page - 1) * take;

      const result = await this.prisma.superHero.findMany({
        skip,
        take,
        select: {
          id: true,
          nickname: true,
          real_name: true,
          origin_description: true,
          superpowers: true,
          catch_phrase: true,
          images: {
            select: {
              id: true,
              mimeType: true,
              data: true,
            },
            take: 1,
          },
        },
      });

      if (result.length < 1) throw new NotFoundException();

      return result.map((hero) => ({
        ...hero,
        images: hero.images.map((image) => ({
          ...image,
          data: `data:${image.mimeType};base64,${Buffer.from(image.data).toString('base64')}`,
        })),
      }));
    }
  }

  async getOne(id: number) {
    const result = await this.prisma.superHero.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        real_name: true,
        origin_description: true,
        superpowers: true,
        catch_phrase: true,
        images: {
          select: {
            id: true,
            mimeType: true,
            data: true,
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException();
    }

    return {
      ...result,
      images: result.images.map((image) => ({
        ...image,
        data: `data:${image.mimeType};base64,${Buffer.from(image.data).toString('base64')}`,
      })),
    };
  }

  async create(data: CreateHeroDto, files: Array<Express.Multer.File>) {
    if (
      await this.prisma.superHero.findFirst({
        where: {
          OR: [{ nickname: data.nickname }, { real_name: data.real_name }],
        },
      })
    ) {
      throw new BadRequestException();
    }

    const superHero = await this.prisma.superHero.create({
      data: {
        nickname: data.nickname,
        real_name: data.real_name,
        superpowers: data.superpowers,
        origin_description: data.origin_description,
        catch_phrase: data.catch_phrase,
        images: {
          create: files.map((file) => ({
            data: file.buffer,
            mimeType: file.mimetype,
          })),
        },
      },
    });

    return superHero;
  }

  async update(
    id: number,
    data: UpdateHeroDto = {},
    newFiles?: Array<Express.Multer.File>,
  ) {
    const superHero = await this.prisma.superHero.findUnique({ where: { id } });
    if (!superHero) {
      throw new NotFoundException();
    }

    if (newFiles && newFiles.length > 0) {
      for (const file of newFiles) {
        if (!file.buffer) {
          throw new BadRequestException(
            `${file.originalname} does not have a buffer`,
          );
        }
      }
    }

    const updatedSuperHero = await this.prisma.$transaction(async (prisma) => {
      const { deleteImagesIds, ...updateData } = data;

      await prisma.superHero.update({
        where: { id },
        data: {
          ...updateData,
        },
      });

      if (deleteImagesIds && deleteImagesIds.length > 0) {
        await prisma.image.deleteMany({
          where: {
            id: { in: data.deleteImagesIds },
            superheroId: id,
          },
        });
      }

      if (newFiles && newFiles.length > 0) {
        await prisma.image.createMany({
          data: newFiles.map((file) => ({
            data: file.buffer,
            mimeType: file.mimetype,
            superheroId: id,
          })),
        });
      }

      return prisma.superHero.findUnique({
        where: { id },
        include: { images: true },
      });
    });

    return updatedSuperHero;
  }

  async delete(id: number) {
    if (!(await this.getOne(id))) {
      throw new NotFoundException();
    }

    const result = await this.prisma.superHero.delete({ where: { id: id } });

    return result;
  }

  async getPages() {
    const heroes = await this.prisma.superHero.count();

    return Math.ceil(heroes / 5);
  }
}
