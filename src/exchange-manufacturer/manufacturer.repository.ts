import { Repository, EntityRepository } from 'typeorm';
import { Manufacturer } from './manufacturer.entity';
import { Logger, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateManufacturerDto } from './dto/create-manufacturer-dto';

@EntityRepository(Manufacturer)
export class ManufacturerRepository extends Repository<Manufacturer> {
    private logger = new Logger('ManufacturerRepository');

    async allManufacturers(page: number = 1): Promise<Manufacturer[]> {
        if (page > 0) {
            return await this.find({
                order: {
                    name: 'ASC',
                },
                take: 50,
                skip: 50 * (page - 1),
            });
        } else {
            return await this.find({
                order: {
                    name: 'ASC',
                },
            });
        }
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
