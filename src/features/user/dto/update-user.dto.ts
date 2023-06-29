import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {

    @IsEmail()
    email: string

    @MinLength(3, {message: 'username must be at least 3 characters long'})
    @IsString()
    username: string

    @IsOptional()
    @MinLength(6, {message: 'password must be at least 6 characters long'})
    @IsString()
    newPassword?: string

    @MinLength(6, {message: 'password must be at least 6 characters long'})
    @IsString()
    password: string

    @IsOptional()
    @IsString()
    phone?: string
}