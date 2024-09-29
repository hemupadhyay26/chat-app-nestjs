import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString() // Ensures the value is a valid date string (e.g., YYYY-MM-DD)
  dob?: string; // Date of birth field
}
