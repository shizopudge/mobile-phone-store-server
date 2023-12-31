import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class LoginDto {
    @IsEmail()
    email: string

    @MinLength(6, {message: 'password must be at least 6 characters long'})
    @IsString()
    password: string

    @IsOptional()
    @IsString()
    deviceToken?: string
}