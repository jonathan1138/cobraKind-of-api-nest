import { Controller, Get, Param, ParseUUIDPipe, Body, UseGuards, Patch, Post, UsePipes, ValidationPipe, Query, Delete } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './tag.entity';
import { ListingStatusValidationPipe } from 'src/shared/pipes/listingStatus-validation.pipe';
import { ListingStatus } from 'src/shared/enums/listing-status.enum';
import { AuthGuard } from '@nestjs/passport';
import { CreateTagDto } from './dto/create-tag-dto';
import { GetUser } from 'src/user-auth/decorators/get-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';

@Controller('tag')
export class TagController {

constructor( private tagService: TagService ) {}

    @Get()
    tag(
        @Query('page') page: number): Promise<Tag[]> {
        return this.tagService.allTags(page);
    }

    @Get('/byId/:id')
    tagById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Tag> {
        return this.tagService.tagsById(id);
    }

    @Get('/market')
    allMarkets(
        @Query('page') page: number,
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto): Promise<Tag[]> {
        return this.tagService.allMarkets(filterDto, page);
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
    updateTagStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status', ListingStatusValidationPipe) status: ListingStatus,
        @Body('statusnote') statusNote?: string,
        ): Promise<Tag> {
            return this.tagService.updateTagStatus(id, status, statusNote);
    }

    @Patch('/update/:id')
    @UseGuards(AuthGuard())
    updateTag(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() createTagDto: CreateTagDto,
        ): Promise<void> {
            return this.tagService.updateTag(id, createTagDto);
    }

    @Post('/:categoryid')
    @UseGuards(AuthGuard())
    createTag(
        @Param('categoryid', new ParseUUIDPipe()) categoryId: string,
        @Body() createTagDto: CreateTagDto,
        @GetUser() user: UserEntity,
        ): Promise<Tag> {
        return this.tagService.createTag(createTagDto, categoryId, user.id);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    deleteTag(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.tagService.deleteTag(id);
    }
}
