import { IsString, IsOptional, IsIn, IsDateString, Length, Matches } from 'class-validator';

export class UpdateProfileDto {
  
  @IsOptional() // Optional, but if present, must be a string
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' }) // Enforce name length limits
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 160, { message: 'Bio must not exceed 160 characters' }) // Bio length limit, like Twitter
  bio?: string;

  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'other'], { message: 'Gender must be either male, female, or other' }) // Restrict gender values
  gender?: string;

  @IsOptional()
  @IsDateString({}, { message: 'DOB must be a valid date string' }) // Validate date format (YYYY-MM-DD)
  dob?: string;

  @IsOptional()
  @IsIn(['dark', 'light'], { message: 'Color preference must be either dark or light' }) // Restrict to dark or light
  colorPreference?: 'dark' | 'light';

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Location must not exceed 100 characters' }) // Location length validation
  location?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]*$/, { message: 'Nickname can only contain letters, numbers, and underscores' }) // Strict validation for nickname format
  @Length(2, 30, { message: 'Nickname must be between 2 and 30 characters' }) // Length constraint on nickname
  nickname?: string;
}
