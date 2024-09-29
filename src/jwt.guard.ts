import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from './user/jwt.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.validateToken(token);
      request.user = { id: payload.userId }; // Attach user ID to the request
      return true; // Token is valid
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
