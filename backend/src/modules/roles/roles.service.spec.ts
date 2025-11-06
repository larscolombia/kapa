import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '@entities/role.entity';
import { Repository } from 'typeorm';

describe('RolesService', () => {
  let service: RolesService;
  let roleRepository: Repository<Role>;

  const mockRoleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRoles', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        { role_id: 1, name: 'Administrador' },
        { role_id: 2, name: 'Usuario KAPA' },
        { role_id: 3, name: 'Contratista' },
        { role_id: 4, name: 'Cliente' },
        { role_id: 5, name: 'Subcontratista' },
      ];

      mockRoleRepository.find.mockResolvedValue(mockRoles);

      const result = await service.getRoles();

      expect(result).toEqual(mockRoles);
      expect(mockRoleRepository.find).toHaveBeenCalled();
    });

    it('should return empty array when no roles exist', async () => {
      mockRoleRepository.find.mockResolvedValue([]);

      const result = await service.getRoles();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockRoleRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.getRoles()).rejects.toThrow('Database error');
    });
  });
});
