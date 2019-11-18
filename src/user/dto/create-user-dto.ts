import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(2)
    @MaxLength(22)
    name: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(
        /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(.*[a-z]).*$/,
        { message: 'New password must contain at least 1 upper & lower case character & 1 number'},
    )
    password: string;
}
