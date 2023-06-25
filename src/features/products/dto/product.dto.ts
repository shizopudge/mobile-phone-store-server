import { DisplayType, OperatingSystem } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ProductDto {

    @IsNotEmpty({message: 'Description must not be empty'})
    @IsString()
    description: string

    @IsOptional()
    inStockCount?: number

    @IsNotEmpty({message: 'Cost must not be empty'})
    cost: number

    @IsNotEmpty({message: 'Color must not be empty'})
    @IsString()
    color: string

    @IsNotEmpty({message: 'Storage must not be empty'})
    storage: number

    @IsNotEmpty({message: 'Pixel density must not be empty'})
    pixelDensity: number

    @IsNotEmpty({message: 'Screen refresh time must not be empty'})
    screenRrefreshRate: number

    @IsNotEmpty({message: 'Screen diagonal must not be empty'})
    screenDiagonal: number

    @IsNotEmpty({message: 'Weight must not be empty'})
    weight: number

    @IsNotEmpty({message: 'Screen resolution must not be empty'})
    @IsString()
    screenResolution: string

    @IsNotEmpty({message: 'Operating system must not be empty'})
    @IsEnum(OperatingSystem, {message: `Enter a valid operating system: ${OperatingSystem.IOS, OperatingSystem.ANDROID}`})
    operatingSystem: string

    @IsNotEmpty({message: 'Display type must not be empty'})
    @IsEnum(DisplayType, {message: `Enter a valid display type: ${DisplayType.AMOLED, DisplayType.IPS, DisplayType.OLED, DisplayType.SuperAMOLED, DisplayType.TN}`})
    displayType: string

    @IsOptional()
    images?: string[]

    @IsOptional()
    discount?: number
}