import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubVariationService } from './sub-variation.service';
import { SubVariationController } from './sub-variation.controller';
import { SubVariationRepository } from './sub-variation.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubVariationRepository]) ],
  controllers: [SubVariationController],
  providers: [SubVariationService],
})
export class SubVariationModule {}
