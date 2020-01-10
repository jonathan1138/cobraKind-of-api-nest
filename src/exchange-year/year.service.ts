import { Injectable, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { YearCreatedRepository } from './year.repository';
import { YearCreated } from './year.entity';
import { CreateYearDto } from './dto/create-year-dto';

@Injectable()
export class YearCreatedService {
    constructor(
        @InjectRepository(YearCreatedRepository)
        private yearCreatedRepository: YearCreatedRepository,
    ) {}

    async allYears(page: number = 1): Promise<YearCreated[]> {
        return this.yearCreatedRepository.allYears(page);
    }

    async deleteYear(id: string): Promise<void> {
        const result = await this.yearCreatedRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Year with ID ${id} not found`);
        }
    }

    async updateYear(id: string, createYearDto: CreateYearDto): Promise<void> {
        if ( createYearDto.year ) {
            const newYear = await this.yearCreatedRepository.getYearCreatedById(id);
            if (newYear) {
                newYear.year = createYearDto.year;
                if (createYearDto.era) {
                    newYear.era = createYearDto.era;
                }
                await newYear.save();
            } else {
                throw new NotFoundException('Cannot find Year');
            }
        } else {
          throw new NotAcceptableException(`Update details not provided`);
        }
    }

    async createYear(createYearDto: CreateYearDto): Promise<YearCreated> {
        return this.yearCreatedRepository.createYear(createYearDto);
    }
}
