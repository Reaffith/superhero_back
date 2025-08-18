import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SuperHeroModule } from './super-hero/super-hero.module';

@Module({
  imports: [PrismaModule, SuperHeroModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
