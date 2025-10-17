import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '@entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'email', // especifica que usaremos 'email' en lugar de 'username'
            session: false, // Deshabilitar sesiones
        }); 
    }

    async validate(email: string, password: string): Promise<User> {
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException('Email o contraseña incorrectos');
        }
        if (user.state === 'inactive') {
            throw new UnauthorizedException('Tu cuenta esta inactiva, por favor contacta con el administrador');
        }
        return user;
    }
}
