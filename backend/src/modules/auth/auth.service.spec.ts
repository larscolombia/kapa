import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@entities/user.entity';
import { Role } from '@entities/role.entity';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    decode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRolePermissions', () => {
    it('should return role permissions for existing role', async () => {
      const mockRole = {
        role_id: 1,
        name: 'Administrador',
        access: [
          {
            module_name: 'user_management',
            can_view: true,
            can_edit: true,
          },
          {
            module_name: 'project_management',
            can_view: true,
            can_edit: true,
          },
        ],
      };

      mockRoleRepository.findOne.mockResolvedValue(mockRole);

      const result = await service.getRolePermissions(1);

      expect(result).toEqual({
        role_id: 1,
        permissions: [
          {
            module_name: 'user_management',
            can_view: true,
            can_edit: true,
          },
          {
            module_name: 'project_management',
            can_view: true,
            can_edit: true,
          },
        ],
      });
    });

    it('should throw error for non-existing role', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.getRolePermissions(999)).rejects.toThrow(
        'No se encontro el rol',
      );
    });
  });

  describe('login', () => {
    it('should generate access token for valid user', async () => {
      const mockUser = {
        email: 'admin@kapa.com',
        user_id: 1,
        role: { role_id: 1, name: 'Administrador' },
        state: 'active',
      };

      const mockToken = 'mock-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser as any);

      expect(result).toEqual({
        accessToken: mockToken,
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        userId: mockUser.user_id,
        role: mockUser.role,
        state: mockUser.state,
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile without sensitive data', async () => {
      const mockUser = {
        user_id: 1,
        name: 'Usuario administrador',
        email: 'admin@kapa.com',
        password: 'hashed-password',
        role: { role_id: 1, name: 'Administrador' },
        state: 'active',
        reset_password_token: null,
        reset_password_expires: null,
      };

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(result).toEqual({
        name: 'Usuario administrador',
        email: 'admin@kapa.com',
        role: { role_id: 1, name: 'Administrador' },
        state: 'active',
      });

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('user_id');
      expect(result).not.toHaveProperty('reset_password_token');
    });

    it('should throw error for non-existing user', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(
        'El usuario no existe',
      );
    });
  });
});
