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
    private readonly configService: ConfigService,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService // Inject JWT service
  ) {
    const accountSid = configService.get('TWILIO_ACCOUNT_SID');
    const authToken = configService.get('TWILIO_AUTH_TOKEN');
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
  async sendOtp(phoneNumber: string): Promise<{ msg: string }> {
    const serviceSid = this.configService.get('TWILIO_VERIFICATION_SERVICE_SID');
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

    // Check if user exists or create a new entry
    let user = await this.userRepository.findOne({ where: { phoneNumber } });
    if (!user) {
      user = this.userRepository.create({ phoneNumber, otpExpiresAt });
    } else {
      if (user.isVerified) {
        return { msg: 'User is already verified' };
      }
      user.otpExpiresAt = otpExpiresAt; // Update expiration if user already exists
    }

    // Send OTP via Twilio (Add your Twilio integration here)
    let msg = '';
    await this.twilioClient.verify.v2
      .services(serviceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' })
      .then((verification) => (msg = verification.status));

    // Update user status to "pending" after sending the OTP
    user.isVerified = false; // Mark user as not verified yet
    await this.userRepository.save(user);

    return { msg: 'OTP sent successfully' }; // Return response
  }

  // Verify OTP
  async verifyOtp(phoneNumber: string, code: string): Promise<{ msg: string; token?: string }> {
    const serviceSid = this.configService.get('TWILIO_VERIFICATION_SERVICE_SID');
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
