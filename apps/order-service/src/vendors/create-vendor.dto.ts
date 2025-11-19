import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateVendorDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2, { message: 'Vendor name must be at least 2 characters' })
    @MaxLength(100, { message: 'Vendor name is too long' })
    name: string;
}
