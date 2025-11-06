import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@entities/user.entity';
import { Role } from '@entities/role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
const axios = require('axios');

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    console.log('=== VALIDATE USER ===');
    console.log('Email:', email);
    console.log('Password:', pass);
    
    const user = await this.usersRepository.findOne({ 
      where: { email },
      relations: ['role']
    });    
    
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User email:', user.email);
      console.log('User state:', user.state);
      console.log('User role:', user.role);
      
      const passwordMatch = await bcrypt.compare(pass, user.password);
      console.log('Password match:', passwordMatch);
      
      if (passwordMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      email: user.email,
      userId: user.user_id,
      role: user.role,
      state: user.state,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async getPayloadFromToken(token: string, key: string): Promise<any> {
    const decoded = this.jwtService.decode(token);
    return decoded[key];
  }

  async verifyCaptcha(captchatToken) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchatToken}`;
    try {
      const response = await axios.post(url);
      return response.data.success;
    } catch (error) {
      console.error('Error verifying reCAPTCHA:', error);
      return false;
    }
  }

  async getProfile(userId: number): Promise<Partial<User> | undefined> {
    const user = await this.usersRepository.findOneBy({ user_id: userId });
    if (!user) throw new NotFoundException('El usuario no existe');
    const {
      password,
      user_id,
      reset_password_expires,
      reset_password_token,
      ...profile
    } = user;
    return profile;
  }

  async getRolePermissions(
    role_id: number,
  ): Promise<{ role_id: number; permissions: any[] }> {
    const role = await this.roleRepository.findOne({
      where: { role_id },
      relations: ['access'],
    });

    if (!role) {
      throw new Error('No se encontro el rol');
    }

    const permissions = role.access.map((access) => ({
      module_name: access.module_name,
      can_view: access.can_view,
      can_edit: access.can_edit,
    }));

    return {
      role_id: role.role_id,
      permissions,
    };
  }
}
