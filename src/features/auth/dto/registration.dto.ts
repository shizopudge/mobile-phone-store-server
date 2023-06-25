import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator";

export class RegistrationDto {
    @IsEmail()
    email: string
    
    @MinLength(3, {message: 'Username must be at least 3 characters long'})
    @IsString()
    username: string

    @MinLength(6, {message: 'Password must be at least 6 characters long'})
    @IsString()
    password: string

    @IsOptional()
    //? @IsPhoneNumber()
    @IsString()
    phone?: string
}