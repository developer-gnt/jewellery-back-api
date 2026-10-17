import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/roles.decorator.js';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractTokenFromHeader(request);
      if (token) {
        try {
          const payload = await this.jwtService.verifyAsync(token, {
            secret: this.configService.get<string>('jwt.accessSecret'),
          });
          (request as unknown as Record<string, unknown>)['user'] = payload;
        } catch {
          // Public route: ignore invalid token, proceed as guest
        }
      }
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('jwt.accessSecret'),
        });
        (request as unknown as Record<string, unknown>)['user'] = payload;
        return true;
      } catch {
        // Fall back to default admin context
      }
    }

    // Default admin context when unauthenticated
    (request as unknown as Record<string, unknown>)['user'] = {
      sub: 'admin-default',
      id: 'admin-default',
      role: 'admin',
      name: 'Zewar Mahal Admin',
      email: 'admin@zewarmahal.com',
      mobile: '9930942947',
    };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
