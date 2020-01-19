import { Repository, EntityRepository } from 'typeorm';
import { CreatedYear } from './year.entity';
import { Logger, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateYearDto } from './dto/create-year-dto';

@EntityRepository(CreatedYear)
export class CreatedYearRepository extends Repository<CreatedYear> {
    private logger = new Logger('CreatedYearRepository');

    async allYears(page: number = 1): Promise<CreatedYear[]> {
        if (page > 0) {
            return await this.find({
                order: {
                    year: 'ASC',
                },
                take: 50,
                skip: 50 * (page - 1),
            });
        } else {
            return await this.find({
                order: {
                    year: 'ASC',
                },
            });
        }
    }

    async getCreatedYearById(id: string): Promise<CreatedYear> {
        const found = await this.findOne(id);
        if (!found) {
            throw new NotFoundException('CreatedYear Not found');
        }
        return found;
    }

    async checkYearByName(year: number): Promise<CreatedYear> {
        const query = this.createQueryBuilder('year')
        .andWhere('year.year = :year', { year });
        const found = await query.getOne();
        return found;
    }

    async createYear(createYearDto: CreateYearDto): Promise<CreatedYear> {
        const newYear = new CreatedYear();
        const {year, era } = createYearDto;
        newYear.year = year;
        newYear.era = era;
        try {
            await newYear.save();
            return newYear;
        } catch (error) {
            if (error.code === '23505') { // duplicate cat name
                this.logger.error(`Failed to create a Year`, error.stack);
                throw new ConflictException('Year already exists');
            } else {
                this.logger.error(`Failed to create a year`, error.stack);
                throw new InternalServerErrorException();
            }
        }
    }
}
