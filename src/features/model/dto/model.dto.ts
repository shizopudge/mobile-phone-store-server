import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ModelDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsNumber()
    manufacturerId: number
}