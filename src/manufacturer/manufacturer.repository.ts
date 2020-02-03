import { Repository, EntityRepository } from 'typeorm';
import { Manufacturer } from './manufacturer.entity';
import { Logger, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateManufacturerDto } from './dto/create-manufacturer-dto';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';

@EntityRepository(Manufacturer)
export class ManufacturerRepository extends Repository<Manufacturer> {
    private logger = new Logger('ManufacturerRepository');

    async allManufacturers(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Manufacturer[]> {
        const { search } = filterDto;
        const query = this.createQueryBuilder('manufacturer')
        .leftJoinAndSelect('manufacturer.exchanges', 'exchange')
        .select(['manufacturer', 'exchange.id', 'exchange.name']);
        if (search) {
            query.andWhere('(LOWER(manufacturer.name) LIKE :search)', { search: `%${search.toLowerCase()}%` });
        }
        if (page > 0) {
            query.take(15);
            query.skip(15 * (page - 1));
        }
        return await query.orderBy('manufacturer.name', 'ASC').getMany();
    }

    async getManufacturerById(id: string): Promise<Manufacturer> {
        const found = await this.findOne(id);
        if (!found) {
            throw new NotFoundException('Manufacturer Not found');
        }
        return found;
    }

    async checkManufacturerByName(name: string): Promise<Manufacturer> {
        const query = this.createQueryBuilder('manufacturer');
        query.andWhere('manufacturer.name = :name', { name });
        const found = await query.getOne();
        return found;
    }

    async createManufacturer(createManufacturerDto: CreateManufacturerDto): Promise<Manufacturer> {
        const newManufacturer = new Manufacturer();
        newManufacturer.name = createManufacturerDto.name;
        try {
            await newManufacturer.save();
            return newManufacturer;
        } catch (error) {
            if (error.code === '23505') { // duplicate cat name
                this.logger.error(`Failed to create a Manufacturer`, error.stack);
                throw new ConflictException('Manufacturer already exists');
            } else {
                this.logger.error(`Failed to create a manufacturer`, error.stack);
                throw new InternalServerErrorException();
            }
        }
    }
}
