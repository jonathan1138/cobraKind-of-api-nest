import { Repository, EntityRepository } from 'typeorm';
import { Part } from './part.entity';
import { Logger, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { Market } from 'src/market/market.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { CreatedYear } from 'src/created-year/year.entity';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';

@EntityRepository(Part)
export class PartRepository extends Repository<Part> {
    private logger = new Logger('PartRepository');

    async getParts(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Part[]> {
        const query = this.buildQuery(filterDto, page);
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

    async getPartByIdForViews(id: string): Promise<Part> {
        const found = await this.findOne(id, {relations: ['userIpViews']});
        if (!found) {
            throw new NotFoundException('Part Not found');
        }
        return found;
    }

    private buildQuery(filterDto: StatusAndSearchFilterDto, page?: number) {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('part')
        .leftJoinAndSelect('part.createdYear', 'createdYear')
        .leftJoinAndSelect('part.manufacturer', 'manufacturer')
        .leftJoinAndSelect('part.market', 'market')
        .leftJoinAndSelect('part.exchanges', 'exchange')
        .select(['part', 'market.id', 'market.name', 'exchange.id', 'exchange.name', 'createdYear',
            'manufacturer']);
        if (page > 0) {
            query.take(15);
            query.skip(15 * (page - 1));
        }
        if (status) {
            query.andWhere('part.status = :status', { status });
        }
        if (search) {
            query.andWhere('(LOWER(part.name) LIKE :search OR LOWER(part.info) LIKE :search)', { search: `%${search.toLowerCase()}%` });
        }
        return query.orderBy('part.name', 'ASC');
    }

    async createPart(createPartDto: CreatePartDto, market: Market, newYear: CreatedYear, newManufacturer: Manufacturer): Promise<Part> {
        const { name, info, images } = createPartDto;
        const part = new Part();
        part.name = name.replace(/,/g, ' ');
        part.info = info;
        part.images = images;
        part.market = market;
        part.status = ListingStatus.TO_REVIEW;
        part.createdYear = newYear;
        part.manufacturer = newManufacturer;
        part.exchanges = createPartDto.exchanges;
        try {
            await part.save();
            delete part.market;
            delete part.exchanges;
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

    async updatePart(id: string, createPartDto: CreatePartDto, newYear: CreatedYear, newManufacturer: Manufacturer ): Promise<void> {
        const part = await this.getPartById(id);
        const { name, info } = createPartDto;
        part.name = name;
        part.info = info;
        part.createdYear = newYear;
        part.manufacturer = newManufacturer;
        try {
            await part.save();
         } catch (error) {
            this.logger.log(error);
            throw new InternalServerErrorException('Failed to update Part. Check with administrator');
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
