import { Injectable } from '@nestjs/common';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) {}

  generateToken(userId: number): string {
    const payload = { userId };
    const secret = this.configService.get<string>('JWT_SECRET');
    const options = { expiresIn: '2h' };

    return sign(payload, secret, options);
  }

  validateToken(token: string): JwtPayload {
    const secret = this.configService.get<string>('JWT_SECRET');
    return verify(token, secret) as JwtPayload; // Type assertion to JwtPayload
  }
}
