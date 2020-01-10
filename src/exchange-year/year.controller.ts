import { Controller, Get, Query, Delete, UseGuards, Param, ParseUUIDPipe, Patch, Body, Post } from '@nestjs/common';
import { YearCreated } from './year.entity';
import { YearCreatedService } from './year.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateYearDto } from './dto/create-year-dto';

@Controller('yearcreated')
export class YearCreatedController {
    constructor( private yearCreatedService: YearCreatedService ) {}
    @Get()
    tags(@Query('page') page: number): Promise<YearCreated[]> {
        return this.yearCreatedService.allYears(page);
    }
    @Delete('/:id')
    @UseGuards(AuthGuard())
    deleteYear(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.yearCreatedService.deleteYear(id);
    }

    @Patch('/update/:id')
    @UseGuards(AuthGuard())
    updateYear(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() createYearDto: CreateYearDto,
        ): Promise<void> {
            return this.yearCreatedService.updateYear(id, createYearDto);
    }

    @Post()
    @UseGuards(AuthGuard())
    createYear(
        @Body() createYearDto: CreateYearDto,
        ): Promise<YearCreated> {
        return this.yearCreatedService.createYear(createYearDto);
    }
}
