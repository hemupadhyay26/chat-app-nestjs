import { IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber(null) // Accepts any phone number format
  phoneNumber: string;
}
