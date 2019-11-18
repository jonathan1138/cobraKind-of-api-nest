import { Controller, Get, Query, ValidationPipe, ParseUUIDPipe, Param, UseGuards, UsePipes, Post, Delete, Body } from '@nestjs/common';
import { ListingRatingService } from './listing-rating.service';
import { StatusAndSearchFilterDto } from 'src/shared/filters/status-search.filter.dto';
import { ListingRating } from './listing-rating.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/user-auth/decorators/get-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { CreateListingRatingDto } from './dto/create-listing-rating-dto';

// @UseGuards(AuthGuard())
@Controller('listingrating')
export class ListingRatingController {
constructor(private listingRatingService: ListingRatingService) {}

    @Get()
    getListingRatings(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        ): Promise<ListingRating[]> {
        return this.listingRatingService.getListingRatings(filterDto);
    }

    @Get('/:id')
    getListingRatingById(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<ListingRating> {
        return this.listingRatingService.getListingRatingById(id);
    }

    @Get('/exchange/:id')
    getListingRatingsByExchange(
        @Query(ValidationPipe) filterDto: StatusAndSearchFilterDto,
        @Param('id', new ParseUUIDPipe()) id: string): Promise<ListingRating[]> {
            return this.listingRatingService.getListingRatingsByExchange(filterDto, id);
    }

    @Post('/:exchangeid')
    @UseGuards(AuthGuard())
    @UsePipes(ValidationPipe)
    createListingRating(
        @Param('exchangeid', new ParseUUIDPipe()) exchangeId: string,
        @Body() createListingRatingDto: CreateListingRatingDto,
        @GetUser() user: UserEntity,
        ): Promise<ListingRating> {
        return this.listingRatingService.createListingRating(createListingRatingDto, exchangeId, user);
    }

    @Delete('/:id')
    deleteListingRating(
        @Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.listingRatingService.deleteListingRating(id);
    }

    @Post('/like/:id')
    @UseGuards(AuthGuard())
    like(@Param('id') id: string, @GetUser() user: UserEntity): Promise<ListingRating> {
    return this.listingRatingService.likeListingRating(id, user);
    }

    @Post('/dislike/:id')
    @UseGuards(AuthGuard())
    disLike(@Param('id') id: string, @GetUser() user: UserEntity): Promise<ListingRating> {
    return this.listingRatingService.disLikeListingRating(id, user);
    }

    @Post('/vote/:id')
    @UseGuards(AuthGuard())
    vote(@Param('id') id: string, @GetUser() user: UserEntity): Promise<ListingRating> {
    return this.listingRatingService.voteListingRating(id, user);
    }
}
