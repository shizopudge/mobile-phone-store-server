import { UnauthorizedException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import { verify } from 'argon2';
import { UserDto } from '../users/dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { RegistrationDto } from './dto/registration.dto';

@Injectable()
export class AuthService {
    constructor(private jwt: JwtService, private userService: UsersService) {}

    async login(dto: LoginDto) {
        const user = await this.userService.getOneByEmail(dto.email)
        if(!user) throw new NotFoundException('No account registered for this email')
        const isPasswordVerified = await verify(user.password, dto.password)
        if(!isPasswordVerified) throw new UnauthorizedException('Invalid password')
        const tokens = await this.generateTokens(user)
        await this.userService.updateRefreshToken(user.id, tokens.refreshToken)
        const userDto = new UserDto(user.id, user.email, user.username, user.image, user.role, user.phone)
        return {user: userDto, tokens}
    }

    async registration(dto: RegistrationDto) {
        const user = await this.userService.create(dto)
        const tokens = await this.generateTokens(user)
        await this.userService.updateRefreshToken(user.id, tokens.refreshToken)
        const userDto = new UserDto(user.id, user.email, user.username, user.image, user.role, user.phone)
        return {user: userDto, tokens}
    }

    async refreshTokens(authorizationHeader: string) {
        if(!authorizationHeader) throw new UnauthorizedException('Access denied')
        const refreshToken = authorizationHeader.split(' ')[1]
        const payload = this.jwt.decode(refreshToken)
        const uid = payload['id']
        const user = await this.userService.getOneById(uid)
        if(!user) throw new NotFoundException('User not found')
        if(!user.refreshToken) throw new UnauthorizedException('Access denied')
        const isRefreshTokenVerified = await verify(user.refreshToken, refreshToken)
        if(!isRefreshTokenVerified) throw new UnauthorizedException('Access denied')
        const tokens = await this.generateTokens(user)
        await this.userService.updateRefreshToken(uid, tokens.refreshToken)
        return tokens
    }

    async logout(authorizationHeader: string) {
        if(!authorizationHeader) throw new UnauthorizedException('Access denied')
        const accessToken = authorizationHeader.split(' ')[1]
        const payload = this.jwt.decode(accessToken)
        const uid = payload['id']
        const user = await this.userService.getOneById(uid)
        if(!user) throw new NotFoundException('User not found')
        if(!user.refreshToken) throw new UnauthorizedException('Access denied')
        await this.userService.removeRefreshToken(uid)
    }

    private async generateTokens(user: User) {
        const accessToken = await this.jwt.signAsync({id: user.id, role: user.role}, {
            secret: process.env.ACCESS_TOKEN_KEY,
            expiresIn: '15m'
        })
        const refreshToken = await this.jwt.signAsync({id: user.id}, {
            secret: process.env.REFRESH_TOKEN_KEY,
            expiresIn: '7d'
        },
        )
        return {accessToken, refreshToken}
    }
}
