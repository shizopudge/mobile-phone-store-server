import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ProductDto {

    @IsNotEmpty({message: 'description must not be empty'})
    @IsString()
    description: string

    @IsOptional()
    @IsNumber()
    inStockCount?: number

    @IsNotEmpty({message: 'cost must not be empty'})
    @IsNumber()
    cost: number

    @IsNotEmpty({message: 'color must not be empty'})
    @IsString()
    color: string

    @IsNotEmpty({message: 'color code must not be empty'})
    @IsString()
    colorCode: string

    @IsNotEmpty({message: 'storage must not be empty'})
    @IsNumber()
    storage: number

    @IsNotEmpty({message: 'model id must not be empty'})
    @IsString()
    modelId: string

    @IsOptional()
    @IsNumber()
    discount?: number
}