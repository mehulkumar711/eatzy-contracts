import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Phone must be in E.164 format (e.g., +911234567890)'})
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'PIN must be 4 digits'})
  pin: string;
}