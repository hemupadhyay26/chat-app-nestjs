import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { JwtService } from './jwt.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  private twilioClient: Twilio;

  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService // Inject JWT service
  ) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  // Create or update user profile
  async createOrUpdateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<{ msg: string; profile: Profile }> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['profile'] });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.isVerified) {
      throw new BadRequestException('Please verify your user to access the profile');
    }

    // If the user already has a profile, update it
    if (user.profile) {
      Object.assign(user.profile, updateProfileDto);
      const updatedProfile = await this.profileRepository.save(user.profile);
      return { msg: 'Profile updated successfully', profile: updatedProfile };
    }

    // Otherwise, create a new profile
    const profile = this.profileRepository.create({ ...updateProfileDto, user });
    const newProfile = await this.profileRepository.save(profile);
    return { msg: 'Profile created successfully', profile: newProfile };
  }

  // Send OTP
  async sendOtp(phoneNumber: string): Promise<{ msg: string, waitTime?: number }> {
    const serviceSid = process.env.TWILIO_VERIFICATION_SERVICE_SID;
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // OTP expires in 2 hours

    let user = await this.userRepository.findOne({ where: { phoneNumber } });
    const currentTime = new Date();

    if (user) {
      const lastOtpSentAt = user.lastOtpSentAt || new Date(0);
      const timeDifference = currentTime.getTime() - lastOtpSentAt.getTime();

      if (timeDifference < 20 * 1000) { // 20 seconds
        const waitTime = 20 - Math.floor(timeDifference / 1000);
        return { msg: `Please wait ${waitTime} seconds before requesting another OTP.`, waitTime };
      }

      user.otpExpiresAt = otpExpiresAt;
    } else {
      user = this.userRepository.create({ phoneNumber, otpExpiresAt });
    }

    user.lastOtpSentAt = currentTime;
    await this.userRepository.save(user);

    let msg = '';
    await this.twilioClient.verify.v2
      .services(serviceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' })
      .then((verification) => (msg = verification.status)).catch((error) => console.log(error));

    return { msg: 'OTP sent successfully' };
  }

  // Verify OTP
  async verifyOtp(phoneNumber: string, code: string): Promise<{ msg: string; token?: string }> {
    const serviceSid = process.env.TWILIO_VERIFICATION_SERVICE_SID
    let msg = '';

    // Verify the OTP using Twilio (Add your Twilio verification here)
    await this.twilioClient.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phoneNumber, code })
      .then((verification) => (msg = verification.status));

    // Check if the verification was successful
    if (msg === 'approved') {
      const user = await this.userRepository.findOne({ where: { phoneNumber } });
      if (!user || user.otpExpiresAt < new Date()) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      // Update user status to "verified"
      user.isVerified = true; // Mark user as verified
      await this.userRepository.save(user);

      // Generate JWT token
      const token = this.jwtService.generateToken(user.id);

      return { msg: 'User verified successfully', token };
    } else {
      throw new BadRequestException('OTP verification failed');
    }
  }
}
