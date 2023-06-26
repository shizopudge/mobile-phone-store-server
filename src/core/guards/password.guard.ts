import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { verify } from 'argon2';
import { UsersService } from 'src/features/users/users.service';

@Injectable()
export class PasswordGuard implements CanActivate {
    constructor(private usersService: UsersService) {}
 async canActivate(
    context: ExecutionContext,
  ) {
    const request = context.switchToHttp().getRequest()
    const user = await this.usersService.getUserByAuthHeader(request.header('Authorization'), {password: true})
    const password = request.body.password
    if(!password) throw new ForbiddenException('Invalid password')
    const isPasswordVerified = await verify(user.password, password)
    if(!isPasswordVerified) throw new ForbiddenException('Invalid password')
    return true
  }
}