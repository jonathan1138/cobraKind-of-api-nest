import { Controller, Delete, Get, Query, UseGuards, Patch, Post, ParseUUIDPipe, Body, Param } from '@nestjs/common';
import { Manufacturer } from './manufacturer.entity';
import { ManufacturerService } from './manufacturer.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateManufacturerDto } from './dto/create-manufacturer-dto';

@Controller('manufacturer')
export class ManufacturerController {
    constructor( private createdYearService: ManufacturerService ) {}
    @Get()
    manufacturers(@Query('page') page: number): Promise<Manufacturer[]> {
        return this.createdYearService.allManufacturers(page);
    }
    @Delete('/:id')
    @UseGuards(AuthGuard())
    deleteManufacturer(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.createdYearService.deleteManufacturer(id);
    }

    @Patch('/update/:id')
    @UseGuards(AuthGuard())
    updateManufacturer(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() createManufacturerDto: CreateManufacturerDto,
        ): Promise<void> {
            return this.createdYearService.updateManufacturer(id, createManufacturerDto);
    }

    @Post()
    @UseGuards(AuthGuard())
    createManufacturer(
        @Body() createManufacturerDto: CreateManufacturerDto,
        ): Promise<Manufacturer> {
        return this.createdYearService.createManufacturer(createManufacturerDto);
    }
}
