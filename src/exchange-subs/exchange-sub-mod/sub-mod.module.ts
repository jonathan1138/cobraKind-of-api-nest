import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubModService } from './sub-mod.service';
import { SubModController } from './sub-mod.controller';
import { SubModRepository } from './sub-mod.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubModRepository]) ],
  controllers: [SubModController],
  providers: [SubModService],
})
export class SubModModule {}
