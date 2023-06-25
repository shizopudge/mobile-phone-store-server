import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ManufacturerDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsOptional()
    @IsString()
    image?: string
}