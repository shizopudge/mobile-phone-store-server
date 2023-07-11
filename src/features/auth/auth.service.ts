import { UnauthorizedException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserRole } from '@prisma/client';
import { verify } from 'argon2';
import { LoginDto } from './dto/login.dto';
import { RegistrationDto } from './dto/registration.dto';
import { PrismaService } from 'src/core/service/prisma.service';
import { AuthorizedUserDto } from './dto/authorized-user.dto';

@Injectable()
export class AuthService {
    constructor(private jwt: JwtService, private userService: UserService, private prisma: PrismaService) {}

    async registration(dto: RegistrationDto) {
        const user = await this.userService.create(dto)
        const tokens = await this.generateTokens(user.id, user.role)
        await this.userService.updateRefreshToken(user.id, tokens.refreshToken)
        const returnUser = await this.userService.getCurrentUser(`Bearer ${tokens.accessToken}`);
        return {user: returnUser, tokens}
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({where: {email: dto.email}})
        if(!user) throw new NotFoundException('No account registered for this email')
        const isPasswordVerified = await verify(user.password, dto.password)
        if(!isPasswordVerified) throw new UnauthorizedException('Invalid password')
        const tokens = await this.generateTokens(user.id, user.role)
        await this.userService.updateRefreshToken(user.id, tokens.refreshToken)
        const returnUser = await this.userService.getCurrentUser(`Bearer ${tokens.accessToken}`);
        return {user: returnUser, tokens}
    }

    async logout(authorizationHeader: string) {
        const user = await this.userService.getUserByAuthHeader(authorizationHeader, {refreshToken: true})
        if(!user.refreshToken) throw new UnauthorizedException('Access denied')
        await this.userService.removeRefreshToken(user.id)
    }

    async refreshTokens(authorizationHeader: string) {
        const user = await this.userService.getUserByAuthHeader(authorizationHeader, {refreshToken: true})
        if(!user.refreshToken) throw new UnauthorizedException('Access denied')
        const refreshToken = authorizationHeader.split(' ')[1]
        const isRefreshTokenVerified = await verify(user.refreshToken, refreshToken)
        if(!isRefreshTokenVerified) throw new UnauthorizedException('Access denied')
        const tokens = await this.generateTokens(user.id, user.role)
        await this.userService.updateRefreshToken(user.id, tokens.refreshToken)
        return tokens
    }

    private async generateTokens(uid: string, role: UserRole) {
        const accessToken = await this.jwt.signAsync({id: uid, role}, {
            secret: process.env.ACCESS_TOKEN_KEY,
            expiresIn: '15m'
        })
        const refreshToken = await this.jwt.signAsync({id: uid}, {
            secret: process.env.REFRESH_TOKEN_KEY,
            expiresIn: '7d'
        },
        )
        return {accessToken, refreshToken}
    }
}
