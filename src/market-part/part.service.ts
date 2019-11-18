import { Injectable, ConflictException, NotFoundException, NotAcceptableException, Logger } from '@nestjs/common';
import { S3UploadService } from 'src/shared/services/awsS3Upload.service';
import { FileReaderService } from 'src/shared/services/csvFileReaders/fileReader.service';
import { PartRepository } from './part.repository';
import { MarketRepository } from 'src/market/market.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { ImgFolder } from 'src/shared/enums/upload-img-folder.enum';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { Part } from './part.entity';
import { CreatePartDto } from './dto/create-part.dto';

@Injectable()
export class PartService {
    constructor(
        @InjectRepository(MarketRepository)
        private marketRepository: MarketRepository,
        @InjectRepository(PartRepository)
        private partRepository: PartRepository,
        private readonly s3UploadService: S3UploadService,
        private readonly fileReaderService: FileReaderService,
    ) {}

    getParts(filterDto: StatusAndSearchFilterDto): Promise<Part[]> {
        return this.partRepository.getParts(filterDto);
    }

    async getPartById(id: string): Promise<Part> {
        return await this.partRepository.getPartById(id);
    }

    async getPartsByMarket(filterDto: StatusAndSearchFilterDto, marketId: string): Promise<Part[]> {
       return await this.partRepository.getPartsByMarket(filterDto, marketId);
    }

    async createPart(createPartDto: CreatePartDto, marketId: string, images?: object[]): Promise<Part> {
        const market = await this.marketRepository.getMarketById(marketId);
        const isPartNameUnique = await this.partRepository.isNameUnique(createPartDto.name);

        if ( isPartNameUnique ) {
            if ( Array.isArray(images) && images.length > 0) {
                const s3ImageArray = await this.s3UploadService.uploadImageBatch(images, ImgFolder.PART_IMG_FOLDER);
                createPartDto.images = s3ImageArray;
            }
            return this.partRepository.createPart(createPartDto, market);
        } else {
            throw new ConflictException('Part already exists');
        }
    }

    async deletePart(id: string): Promise<void> {
        const result = await this.partRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Part with ID ${id} not found`);
        }
    }

    async updatePartStatus(id: string, status: ListingStatus ): Promise<Part> {
        const market = await this.partRepository.getPartById(id);
        market.status = status;
        await market.save();
        return market;
    }

    async uploadPartImage(id: string, image: any): Promise<void> {
        if (image) {
            const market = await this.partRepository.getPartById(id);
            if ( image ) {
                const s3ImgUrl = await this.s3UploadService.uploadImage(image, ImgFolder.PART_IMG_FOLDER);
                market.images.push(s3ImgUrl);
                await market.save();
            }
        } else {
            throw new NotAcceptableException(`File not found`);
        }
    }

    async deletePartImages(id: string): Promise<string[]> {
        const market = await this.partRepository.getPartById(id);
        let arrayImages: string[] = [];
        arrayImages = market.images;
        market.images = [];
        await market.save();
        return arrayImages;
    }

    async loadPartsFile(filename: string): Promise<void> {
        Logger.log('Work in progress');
        this.fileReaderService.importPartFileToDb(filename);
    }

    // getAllParts(): Part[] {
    //     const copiedParts = JSON.parse(JSON.stringify(this.Parts));
    //     return copiedParts;
    // }
}
