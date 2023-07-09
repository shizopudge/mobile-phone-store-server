import { OperatingSystem, DisplayType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ModelDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty({message: 'description must not be empty'})
    @IsString()
    description: string

    @IsNotEmpty({message: 'pixel density must not be empty'})
    @IsNumber()
    pixelDensity: number

    @IsNotEmpty({message: 'screen refresh rate must not be empty'})
    @IsNumber()
    screenRefreshRate: number

    @IsNotEmpty({message: 'screen diagonal must not be empty'})
    @IsNumber()
    screenDiagonal: number

    @IsNotEmpty({message: 'weight must not be empty'})
    @IsNumber()
    weight: number

    @IsNotEmpty({message: 'screen resolution must not be empty'})
    @IsString()
    screenResolution: string

    @IsNotEmpty({message: 'operating system must not be empty'})
    @IsEnum(OperatingSystem, {message: `Enter a valid operating system: ${OperatingSystem.IOS} or ${OperatingSystem.ANDROID}`})
    operatingSystem: OperatingSystem

    @IsNotEmpty({message: 'display type must not be empty'})
    @IsEnum(DisplayType, {message: `Enter a valid display type: ${DisplayType.AMOLED}, ${DisplayType.IPS}, ${DisplayType.OLED}, ${DisplayType.SuperAMOLED}, ${DisplayType.TN}`})
    displayType: DisplayType

    @IsNotEmpty()
    @IsString()
    manufacturerId: string
}