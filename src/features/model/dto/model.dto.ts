import { OperatingSystem, DisplayType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ModelDto {
    @IsNotEmpty()
    @IsString()
    name: string

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

    @IsNotEmpty()
    @IsString()
    manufacturerId: string
}