import { DisplayType, OperatingSystem } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

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

    @IsNotEmpty({message: 'Pixel density must not be empty'})
    @IsNumber()
    pixelDensity: number

    @IsNotEmpty({message: 'Screen refresh rate must not be empty'})
    @IsNumber()
    screenRefreshRate: number

    @IsNotEmpty({message: 'Screen diagonal must not be empty'})
    @IsNumber()
    screenDiagonal: number

    @IsNotEmpty({message: 'Weight must not be empty'})
    @IsNumber()
    weight: number

    @IsNotEmpty({message: 'Screen resolution must not be empty'})
    @IsString()
    screenResolution: string

    @IsNotEmpty({message: 'Operating system must not be empty'})
    @IsEnum(OperatingSystem, {message: `Enter a valid operating system: ${OperatingSystem.IOS} or ${OperatingSystem.ANDROID}`})
    operatingSystem: OperatingSystem

    @IsNotEmpty({message: 'Display type must not be empty'})
    @IsEnum(DisplayType, {message: `Enter a valid display type: ${DisplayType.AMOLED}, ${DisplayType.IPS}, ${DisplayType.OLED}, ${DisplayType.SuperAMOLED}, ${DisplayType.TN}`})
    displayType: DisplayType

    @IsNotEmpty({message: 'Model id must not be empty'})
    @IsString()
    modelId: string

    @IsOptional()
    @IsNumber()
    discount?: number
}