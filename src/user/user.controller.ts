import { Controller, Post, Body, Patch, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from 'src/jwt.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return await this.userService.sendOtp(sendOtpDto.phoneNumber);
  }

  @Post('/verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.userService.verifyOtp(verifyOtpDto.phoneNumber, verifyOtpDto.code);
  }

  @Patch('/profile')
  @UseGuards(JwtAuthGuard) // Protect this route with JWT guard
  async createOrUpdateProfile(@Req() request, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = request.user.id; // Get the user ID from the request
    const profile = await this.userService.createOrUpdateProfile(userId, updateProfileDto);
    return profile;
  }
}
