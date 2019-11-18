import { IsString, MinLength, MaxLength, Matches, IsEmail, IsOptional } from 'class-validator';

export class UserInfoDto {

    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(
        /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(.*[a-z]).*$/,
        { message: 'Must Contain at least 1 upper & lower case character & 1 number'},
    )
    updatePassword: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(22)
    updateUsername: string;

    @IsOptional()
    @IsEmail()
    @MinLength(7)
    @MaxLength(99)
    email: string;

    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(20)
    mobile: string;

    @IsOptional()
    @MaxLength(138)
    bio: string;

    @IsOptional()
    @IsString()
    @MaxLength(138)
    interests: string;
}
