import { Repository, EntityRepository } from 'typeorm';
import { SubMod } from './sub-mod.entity';
import { Logger } from '@nestjs/common';

@EntityRepository(SubMod)
export class SubModRepository extends Repository<SubMod> {
    private logger = new Logger('SubModRepository');

}
