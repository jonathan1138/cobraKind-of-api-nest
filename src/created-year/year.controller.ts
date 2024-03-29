import { Controller, Get, Query, Delete, UseGuards, Param, ParseUUIDPipe, Patch, Body, Post } from '@nestjs/common';
import { CreatedYear } from './year.entity';
import { CreatedYearService } from './year.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateYearDto } from './dto/create-year-dto';

@Controller('createdyear')
export class CreatedYearController {
    constructor( private createdYearService: CreatedYearService ) {}
    @Get()
    tags(@Query('page') page: number): Promise<CreatedYear[]> {
        return this.createdYearService.allYears(page);
    }
    @Delete('/:id')
    @UseGuards(AuthGuard())
    deleteYear(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.createdYearService.deleteYear(id);
    }

    @Patch('/update/:id')
    @UseGuards(AuthGuard())
    updateYear(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() createYearDto: CreateYearDto,
        ): Promise<void> {
            return this.createdYearService.updateYear(id, createYearDto);
    }

    @Post()
    @UseGuards(AuthGuard())
    createYear(
        @Body() createYearDto: CreateYearDto,
        ): Promise<CreatedYear> {
        return this.createdYearService.createYear(createYearDto);
    }
}
