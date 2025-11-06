import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsersWithoutPassword', () => {
    it('should return users without password field', async () => {
      const mockUsers = [
        {
          user_id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashed-password',
          role: { role_id: 1, name: 'Administrador' },
          state: 'active',
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.getUsersWithoutPassword();

      expect(result).toEqual([
        {
          user_id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: { role_id: 1, name: 'Administrador' },
          state: 'active',
        },
      ]);

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        relations: ['role'],
      });
    });
  });

  describe('getUserWithoutPassword', () => {
    it('should return user without password field', async () => {
      const mockUser = {
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        role: { role_id: 1, name: 'Administrador' },
        state: 'active',
        reset_password_token: null,
        reset_password_expires: null,
      };

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.getUserWithoutPassword(1);

      expect(result).toEqual({
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { role_id: 1, name: 'Administrador' },
        state: 'active',
      });

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('reset_password_token');
    });

    it('should throw NotFoundException for non-existing user', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getUserWithoutPassword(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateUserRequiredFields', () => {
    it('should validate required fields for new user', async () => {
      const validUser = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'TestPassword123!',
        role: { role_id: 1 },
        state: 'active',
      };

      await expect(
        service.validateUserRequiredFields(validUser as any),
      ).resolves.not.toThrow();
    });

    it('should throw error for missing required fields', async () => {
      const invalidUser = {
        email: '',
        name: 'Test User',
      };

      await expect(
        service.validateUserRequiredFields(invalidUser as any),
      ).rejects.toThrow('El campo "email" es obligatorio');
    });
  });

  describe('validateUserPassword', () => {
    it('should validate strong password', async () => {
      const userWithStrongPassword = {
        password: 'StrongPassword123!',
      };

      await expect(
        service.validateUserPassword(userWithStrongPassword as any),
      ).resolves.not.toThrow();
    });

    it('should throw error for weak password', async () => {
      const userWithWeakPassword = {
        password: 'weak',
      };

      await expect(
        service.validateUserPassword(userWithWeakPassword as any),
      ).rejects.toThrow(
        'La contraseña debe tener al menos una letra mayúscula, un carácter especial y una longitud mínima de 8 caracteres',
      );
    });
  });

  describe('validateStateEnum', () => {
    it('should validate active state', async () => {
      await expect(service.validateStateEnum('active')).resolves.not.toThrow();
    });

    it('should validate inactive state', async () => {
      await expect(service.validateStateEnum('inactive')).resolves.not.toThrow();
    });

    it('should throw error for invalid state', async () => {
      await expect(service.validateStateEnum('invalid')).rejects.toThrow(
        'El estado debe ser activo o inactivo',
      );
    });
  });
});
