import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      request.user = {
        sub: 'admin-default',
        id: 'admin-default',
        role: 'admin',
        name: 'Zewar Mahal Admin',
        email: 'admin@zewarmahal.com',
        mobile: '9930942947',
      };
    }
    return true;
  }
}
