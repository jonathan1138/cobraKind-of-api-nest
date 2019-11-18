import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { SubExchangeType } from '../../shared/enums/sub-exchange-type.enum';

export class MarketShapeDto {
    @IsOptional()
    @IsString()
    namingConvention: string;

    @IsOptional()
    @IsString()
    partsConvention: string;

    @IsOptional()
    @IsString()
    setConvention: string;

    @IsOptional()
    @IsEnum(SubExchangeType, {each: true})
    subExchangeType: SubExchangeType;

    @IsOptional()
    @IsString()
    subVariationConvention: string;

    @IsOptional()
    @IsString()
    subItemConvention: string;

    @IsOptional()
    @IsString()
    subModConvention: string;
}
