import { Controller, Post, UseInterceptors, UploadedFile, Param, ParseUUIDPipe, Patch, Body, Get, UseGuards, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { S3UploadService } from 'src/shared/services/awsS3Upload.service';
import { ProfileService } from './profile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImgFolder } from 'src/shared/enums/upload-img-folder.enum';
import { TagDataValidationPipe } from 'src/shared/pipes/tagData-validation.pipe';
import { TagData } from 'src/shared/enums/tag-data.enum';
import { Profile } from './profile.entity';

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
    updatePreferredTags(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('tags', TagDataValidationPipe) tags: TagData[],
        ): Promise<void> {
            return this.profileService.updatePreferredTags(id, tags);
    }

    @Patch('/markets/:id')
    updatePreferredMarkets(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('markets') markets: string[],
        ): Promise<void> {
            return this.profileService.updatePreferredMarkets(id, markets);
    }

    @Patch('/exchanges/:id')
    updatePreferredExchanges(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('exchanges') exchanges: string[],
        ): Promise<void> {
            return this.profileService.updatePreferredExchanges(id, exchanges);
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