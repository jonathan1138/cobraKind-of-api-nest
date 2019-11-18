import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubVariationRepository } from './sub-variation.repository';
import { SubVariation } from './sub-variation.entity';

@Injectable()
export class SubVariationService {
    constructor(
        @InjectRepository(SubVariationRepository)
        private subVariationRepository: SubVariationRepository,
    ) {}

    async allSubVariations(): Promise<SubVariation[]> {
        return this.subVariationRepository.allSubVariations();
    }

    async allMarkets(): Promise<SubVariation[]> {
        return this.subVariationRepository.allMarkets();
    }

    async exchangesBySubVariations(ids: string[]): Promise<SubVariation[]> {
        return this.subVariationRepository.exchangesBySubVariations(ids);
    }

    async subVariationsByMarket(id: string): Promise<SubVariation[]> {
        return this.subVariationRepository.subVariationsByMarket(id);
    }

    async subVariationsByName(name: string): Promise<SubVariation> {
        return this.subVariationRepository.subVariationsByName(name);
    }

    async subVariationsForMarket(id: string): Promise<SubVariation[]> {
        return this.subVariationRepository.subVariationsForMarket(id);
    }
}
