import { Controller, Post, UseInterceptors, UploadedFile, Param, ParseUUIDPipe, Patch, Body, Get, UseGuards, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { S3UploadService } from 'src/shared/services/awsS3Upload.service';
import { ProfileService } from './profile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImgFolder } from 'src/shared/enums/upload-img-folder.enum';
import { Profile } from './profile.entity';
import { Tag } from 'src/market-tag/tag.entity';

@Controller('profile')
export class ProfileController {
    constructor( private profileService: ProfileService, private readonly s3UploadService: S3UploadService ) {}

    @Get('')
    allProfiles(): Promise<Profile[]> {
        return this.profileService.getProfiles();
    }

    @Get('/:id')
    profileByUserId(@Param('id', new ParseUUIDPipe()) id: string): Promise<Profile> {
        return this.profileService.getProfileByUserId(id);
    }

    @Patch('/tags/:id')
    @UseGuards(AuthGuard())
    updateWatchedTags(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('tags') tags: string[],
        ): Promise<void> {
            return this.profileService.updateWatchedTags(id, tags);
    }

    @Patch('/markets/:id')
    @UseGuards(AuthGuard())
    updateWatchedMarkets(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('markets') markets: string[],
        ): Promise<void> {
            return this.profileService.updateWatchedMarkets(id, markets);
    }

    @Patch('/exchanges/:id')
    @UseGuards(AuthGuard())
    updateWatchedExchanges(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('exchanges') exchanges: string[],
        ): Promise<void> {
            return this.profileService.updateWatchedExchanges(id, exchanges);
    }

    @Post('uploadPhoto/:id')
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(@UploadedFile() image: any, @Param('id', new ParseUUIDPipe()) id: string): Promise<string> {
        const idResult = await this.profileService.checkIfUserExists(id);
        if ( idResult ) {
            const s3ImgUrl = await this.s3UploadService.uploadImage(image, ImgFolder.PROFILE_IMG_FOLDER);
            this.profileService.updateProfilePhoto(id, s3ImgUrl);
            return s3ImgUrl;
        }
    }

    @Delete('removePhoto/:id')
    @UseGuards(AuthGuard())
    async deleteImage(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        const idResult = await this.profileService.checkIfUserExists(id);
        if ( idResult ) {
            const s3ImgUrl = null;
            this.profileService.updateProfilePhoto(id, s3ImgUrl);
        }
    }
}
