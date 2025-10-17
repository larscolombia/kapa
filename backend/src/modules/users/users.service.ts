import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from '@entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MailUtil } from '@common/utils/mail.util';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) { }

    async create(userData: User): Promise<User> {
        await this.validateUserRequiredFields(userData);
        await this.validateUserWithSameEmail(userData);
        await this.validateUserPassword(userData);
        await this.validateStateEnum(userData.state);
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        const user = this.usersRepository.create({ ...userData, password: hashedPassword, });
        return this.usersRepository.save(user);
    }

    async update(userData: User): Promise<User> {
        const { user_id } = userData;
        const user = await this.usersRepository.findOneBy({ user_id });
        if (!user) throw new NotFoundException('El usuario no existe');
        await this.validateUserRequiredFields(userData, true);
        await this.validateUserWithSameEmail(userData, true);
        await this.validateStateEnum(userData.state);
        user.role = userData.role;
        const updatedUser = this.usersRepository.merge(user, userData);
        return this.usersRepository.save(updatedUser);
    }

    async createPasswordResetToken(email: string): Promise<void> {
        try {
            const user = await this.usersRepository.findOne({ where: { email } });

            if (!user) return;
            const token = randomBytes(32).toString('hex');
            user.reset_password_token = token;
            user.reset_password_expires = new Date(Date.now() + 3600000); // 1 hora
            await this.usersRepository.save(user);

            const resetUrl = `${process.env.URL_FRONT}/restore-password/${token}`;//TODO Hacer la url dinamica

            // Enviar el correo electrónico usando la utilidad MailUtil
            await MailUtil.sendMail({
                to: user.email,
                subject: 'Restablece tu contraseña',
                html: `
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <a href="${resetUrl}">Reestablecer contraseña</a>
            <p>Este enlace expira en 1 hora.</p>
          `,
            });
        } catch (error) {
            console.log(error);
        }
    }

    async validateResetToken(token: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: MoreThan(new Date()),
            },
        });

        if (!user) {
            throw new Error('Token inválido o expirado');
        }

        return user;
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const user = await this.validateResetToken(token);
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        user.reset_password_expires = null;
        user.reset_password_token = null;
        await this.usersRepository.save(user);
    }

    async changePassword(user_id: number, newPassword: string): Promise<void> {
        const user = await this.usersRepository.findOneBy({ user_id });
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        user.reset_password_expires = null;
        user.reset_password_token = null;
        await this.usersRepository.save(user);
    }

    async getUsersWithoutPassword(): Promise<User[] | undefined> {
        return this.usersRepository.find({
            select: {
                user_id: true,
                name: true,
                email: true,
                state: true,
            },
            order: { user_id: 'ASC' },
        });
    }

    async getUserWithoutPassword(userId: number): Promise<Partial<User> | undefined> {
        const user = await this.usersRepository.findOneBy({ user_id: userId });
        if (!user) throw new NotFoundException('El usuario no existe');
        const { password, reset_password_expires, reset_password_token, ...response } = user;
        return response;
    }

    async validateUserWithSameEmail(user: User, isUpdate = false): Promise<void> {
        const userWithSameEmail = await this.usersRepository.findOneBy({ email: user.email });
        if (!isUpdate && userWithSameEmail) throw new Error('Ya existe un usuario con este correo');
        if (isUpdate && userWithSameEmail && userWithSameEmail.user_id !== user.user_id) throw new Error('Ya existe un usuario con este correo');
    }

    async validateUserRequiredFields(user: User, isUpdate = false): Promise<void> {
        if (!user.user_id && isUpdate) throw new Error('El campo "user_id" es obligatorio');
        if (!user.password && !isUpdate) throw new Error('El campo "password" es obligatoria');
        if (!user.email) throw new Error('El campo "email" es obligatorio');
        if (!user.name) throw new Error('El campo "name" es obligatorio');
        if (!user.role) throw new Error('El campo "role" es obligatorio');
        if (!user.state) throw new Error('El campo "state" es obligatorio');
    }

    async validateUserPassword(user: User): Promise<void> {
        const password = user.password;
        const hasUppercase = /[A-Z]/.test(password);
        const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
        const hasMinLength = password.length >= 8;
        if (!hasUppercase || !hasSpecialChar || !hasMinLength) {
            throw new Error('La contraseña debe tener al menos una letra mayúscula, un carácter especial y una longitud mínima de 8 caracteres');
        }
    }

    async validateStateEnum(state: string): Promise<void> {
        if (!['active', 'inactive'].includes(state)) {
            throw new Error('El estado debe ser activo o inactivo');
        }
    }

    async getKapaEmails(): Promise<User[] | undefined> {
        const users = await this.usersRepository
            .createQueryBuilder('user')
            .where('user.role_id IN (:...roleIds)', { roleIds: [1, 2] })
            .select(['user.email'])
            .getMany();

        // const emails = users.map(user => user.email);
        return users;
    }
}