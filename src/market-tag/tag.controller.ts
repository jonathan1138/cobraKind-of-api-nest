import { Controller, Get, Param, ParseUUIDPipe, Body } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './tag.entity';

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
}
