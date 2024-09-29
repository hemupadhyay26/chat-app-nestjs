import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { JwtService } from './jwt.service';
@Module({
  imports: [TypeOrmModule.forFeature([User,Profile])], // Import the User entity here
  controllers: [UserController],
  providers: [UserService, JwtService],
})
export class UserModule {}
