import { IsNotEmpty, IsString } from "class-validator";

export class ModelDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsString()
    manufacturerId: string
}