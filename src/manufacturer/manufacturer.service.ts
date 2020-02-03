import { Injectable, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ManufacturerRepository } from './manufacturer.repository';
import { CreateManufacturerDto } from './dto/create-manufacturer-dto';
import { Manufacturer } from './manufacturer.entity';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';

@Injectable()
export class ManufacturerService {
    constructor(
        @InjectRepository(ManufacturerRepository)
        private manufacturerCreatedRepository: ManufacturerRepository,
    ) {}

    async allManufacturers(filterDto: StatusAndSearchFilterDto, page: number = 1): Promise<Manufacturer[]> {
        return this.manufacturerCreatedRepository.allManufacturers(filterDto, page);
    }

    async deleteManufacturer(id: string): Promise<void> {
        const result = await this.manufacturerCreatedRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Manufacturer with ID ${id} not found`);
        }
    }

    async updateManufacturer(id: string, createManufacturerDto: CreateManufacturerDto): Promise<void> {
        if ( createManufacturerDto.name ) {
            const newManufacturer = await this.manufacturerCreatedRepository.getManufacturerById(id);
            if (newManufacturer) {
                newManufacturer.name = createManufacturerDto.name;
                await newManufacturer.save();
            } else {
                throw new NotFoundException('Cannot find Manufacturer');
            }
        } else {
          throw new NotAcceptableException(`Update details not provided`);
        }
    }

    async createManufacturer(createManufacturerDto: CreateManufacturerDto): Promise<Manufacturer> {
        return this.manufacturerCreatedRepository.createManufacturer(createManufacturerDto);
    }
}
