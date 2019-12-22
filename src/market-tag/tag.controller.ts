import { Controller, Get, Param, ParseUUIDPipe, Body, UseGuards, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './tag.entity';
import { ListingStatusValidationPipe } from 'src/shared/pipes/listingStatus-validation.pipe';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { AuthGuard } from '@nestjs/passport';

@Controller('tag')
export class TagController {

constructor( private tagService: TagService ) {}

    @Get()
    tags(): Promise<Tag[]> {
        return this.tagService.allTags();
    }

    @Get('/markets')
    allMarkets(): Promise<Tag[]> {
        return this.tagService.allMarkets();
    }

    @Get('/marketIds')
    marketsByTags(
        @Body('ids') ids: string[],
        ): Promise<Tag[]> {
        return this.tagService.marketsByTags(ids);
    }

    @Get('/:name')
    tagByName(@Param('name') name: string): Promise<Tag> {
        return this.tagService.tagsByName(name);
    }

    @Get('/:id')
    tagById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Tag> {
        return this.tagService.tagsById(id);
    }

    @Get('markets/:id')
    tagsForMarket(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<Tag[]> {
        return this.tagService.tagsForMarket(id);
    }

    @Get('/category/:id')
    getCategoryById(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<Tag[]> {
        return this.tagService.tagsByCategory(id);
    }

    @Patch('/status/:id')
    @UseGuards(AuthGuard())
    updatecategoryStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        ): Promise<Tag> {
            return this.tagService.updateTagStatus(id, status);
    }

    @Post('/:categoryid')
    @UsePipes(ValidationPipe)
    createTag(
        @Param('categoryid', new ParseUUIDPipe()) categoryId: string,
        @Body() name: string,
        ): Promise<Tag> {
        return this.tagService.createTag(name, categoryId);
    }
}
