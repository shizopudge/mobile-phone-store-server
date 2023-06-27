import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ProductDto {

    @IsNotEmpty({message: 'Description must not be empty'})
    @IsString()
    description: string

    @IsOptional()
    @IsNumber()
    inStockCount?: number

    @IsNotEmpty({message: 'Cost must not be empty'})
    @IsNumber()
    cost: number

    @IsNotEmpty({message: 'Color must not be empty'})
    @IsString()
    color: string

    @IsNotEmpty({message: 'Color code must not be empty'})
    @IsString()
    colorCode: string

    @IsNotEmpty({message: 'Storage must not be empty'})
    @IsNumber()
    storage: number

    @IsNotEmpty({message: 'Model id must not be empty'})
    @IsString()
    modelId: string

    @IsOptional()
    @IsNumber()
    discount?: number
}