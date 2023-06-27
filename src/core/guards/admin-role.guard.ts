import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UserService } from 'src/features/user/user.service';

@Injectable()
export class AdminRoleGuard implements CanActivate {
    constructor(private usersService: UserService) {}
 async canActivate(
    context: ExecutionContext,
  ) {
    const request = context.switchToHttp().getRequest()
    const user = await this.usersService.getUserByAuthHeader(request.header('Authorization'))
    const role = user.role
    if(role === UserRole.CASUAL) throw new ForbiddenException('You do not have permission to perform this operation')
    return true
  }
}