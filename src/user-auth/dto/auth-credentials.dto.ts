import { IsString, MinLength, MaxLength, Matches, IsDefined, IsNotEmpty, IsEmail } from 'class-validator';

export class AuthCredentialsDto {
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    name: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(
        /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(.*[a-z]).*$/,
        { message: 'Must Contain at least 1 upper & lower case character & 1 number'},
    )
    password: string;
}
