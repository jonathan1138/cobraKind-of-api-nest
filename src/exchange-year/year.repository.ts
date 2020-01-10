import { Repository, EntityRepository } from 'typeorm';
import { YearCreated } from './year.entity';
import { Logger, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateYearDto } from './dto/create-year-dto';

@EntityRepository(YearCreated)
export class YearCreatedRepository extends Repository<YearCreated> {
    private logger = new Logger('YearCreatedRepository');

    async allYears(page: number = 1): Promise<YearCreated[]> {
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

    async getYearCreatedById(id: string): Promise<YearCreated> {
        const found = await this.findOne(id);
        if (!found) {
            throw new NotFoundException('YearCreated Not found');
        }
        return found;
    }

    async checkYearByName(year: number): Promise<YearCreated> {
        const query = this.createQueryBuilder('year');
        query.andWhere('year.year = :year', { year });
        const found = await query.getOne();
        return found;
    }

    async createYear(createYearDto: CreateYearDto): Promise<YearCreated> {
        const newYear = new YearCreated();
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
