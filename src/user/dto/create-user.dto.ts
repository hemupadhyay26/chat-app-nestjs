import { IsString, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
  @IsPhoneNumber(null) // Adjust to your preferred country code or remove null for global
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
