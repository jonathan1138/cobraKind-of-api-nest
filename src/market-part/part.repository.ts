import { Repository, EntityRepository } from 'typeorm';
import { Part } from './part.entity';
import { Logger, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { Market } from 'src/market/market.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { YearCreated } from 'src/exchange-year/year.entity';
import { Manufacturer } from 'src/exchange-manufacturer/manufacturer.entity';

@EntityRepository(Part)
export class PartRepository extends Repository<Part> {
    private logger = new Logger('PartRepository');

    async getParts(filterDto: StatusAndSearchFilterDto): Promise<Part[]> {
        const query = this.buildQuery(filterDto);
        try {
            const parts = await query.getMany();
            return parts;
        } catch (error) {
            this.logger.error(`Failed to get parts for user`, error.stack);
            throw new InternalServerErrorException('Failed to get parts for user');
        }
    }

    async getPartsByMarket(filterDto: StatusAndSearchFilterDto, marketId: string): Promise<Part[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('part')
        .andWhere('part.marketId = :marketId', { marketId });
        if (status) {
            query.andWhere('part.status = :status', { status });
        }

        if (search) {
            query.andWhere('(part.name LIKE :search OR part.info LIKE :search)', { search: `%${search}%` });
        }

        const parts = await query.getMany();
        if (parts.length < 1) {
            throw new NotFoundException('Market Not found');
        }
        return parts;
    }

    async getPartById(id: string): Promise<Part> {
        const found = await this.findOne(id);
        if (!found) {
            throw new NotFoundException('Part Not found');
        }
        this.incrementView(id);
        return found;
    }

    private buildQuery(filterDto: StatusAndSearchFilterDto) {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('part');
        if (status) {
            query.andWhere('part.status = :status', { status });
        }
        if (search) {
            query.andWhere('(part.name LIKE :search OR part.info LIKE :search)', { search: `%${search}%` });
        }
        return query;
    }

    async createPart(createPartDto: CreatePartDto, market: Market, newYear: YearCreated, newManufacturer: Manufacturer): Promise<Part> {
        const { name, info, images, manufacturer, year } = createPartDto;
        const part = new Part();
        part.name = name.replace(/,/g, ' ');
        part.info = info;
        part.images = images;
        part.market = market;
        part.status = ListingStatus.TO_REVIEW;
        part.yearCreated = newYear;
        part.manufacturer = newManufacturer;
        // const foundGenre = await this.genreRepository.genresByName(genre);

        try {
            await part.save();
            delete part.market;
            return part;
        } catch (error) {
            if (error.code === '23505') { // duplicate cat name
                this.logger.error(`Failed to create a part`, error.stack);
                throw new ConflictException('Name for Part already exists');
            } else {
                this.logger.error(`Failed to create a part`, error.stack);
                throw new InternalServerErrorException();
            }
        }
    }

    async isNameUnique(name: string): Promise<boolean> {
        const query = this.createQueryBuilder('part').where('part.name = :name', { name });
        try {
            const found = await query.getOne();
            if ( !found ) {
                return true;
            } else {
                return false;
            }
        } catch {
            this.logger.error(`Failed to get part requested`);
            return false;
        }
    }

    async incrementView(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(Part)
        .set({ views: () => 'views + 1' })
        .execute();
    }

    async incrementLike(id: string): Promise<void> {
        await this.createQueryBuilder()
        .update(Part)
        .set({ likes: () => 'likes + 1' })
        .execute();
    }
}
