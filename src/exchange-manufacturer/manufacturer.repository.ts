import { Repository, EntityRepository } from 'typeorm';
import { Manufacturer } from './manufacturer.entity';
import { Logger, NotAcceptableException } from '@nestjs/common';

@EntityRepository(Manufacturer)
export class ManufacturerRepository extends Repository<Manufacturer> {
    private logger = new Logger('ManufacturerRepository');

}
