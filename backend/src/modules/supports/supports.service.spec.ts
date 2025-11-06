import { Test, TestingModule } from '@nestjs/testing';
import { SupportsService } from './supports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SupportFile } from '@entities/support-file.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('SupportsService', () => {
  let service: SupportsService;
  let supportFileRepository: Repository<SupportFile>;

  const mockSupportFileRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportsService,
        {
          provide: getRepositoryToken(SupportFile),
          useValue: mockSupportFileRepository,
        },
      ],
    }).compile();

    service = module.get<SupportsService>(SupportsService);
    supportFileRepository = module.get<Repository<SupportFile>>(
      getRepositoryToken(SupportFile),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSupportFiles', () => {
    it('should return all support files', async () => {
      const mockSupportFiles = [
        {
          support_file_id: 1,
          name: 'test-file.pdf',
          display_name: 'Test File',
          category: 'appendices',
          file_path: 'soportes-de-interes/test-file.pdf',
        },
      ];

      mockSupportFileRepository.find.mockResolvedValue(mockSupportFiles);

      const result = await service.getSupportFiles();

      expect(result).toEqual(mockSupportFiles);
      expect(mockSupportFileRepository.find).toHaveBeenCalledWith({
        relations: ['created_by_user'],
        order: { category: 'ASC', display_name: 'ASC' },
      });
    });
  });

  describe('getSupportFilesByCategory', () => {
    it('should return support files by category', async () => {
      const category = 'appendices';
      const mockSupportFiles = [
        {
          support_file_id: 1,
          name: 'test-file.pdf',
          display_name: 'Test File',
          category: 'appendices',
          file_path: 'soportes-de-interes/test-file.pdf',
        },
      ];

      mockSupportFileRepository.find.mockResolvedValue(mockSupportFiles);

      const result = await service.getSupportFilesByCategory(category);

      expect(result).toEqual(mockSupportFiles);
      expect(mockSupportFileRepository.find).toHaveBeenCalledWith({
        where: { category },
        relations: ['created_by_user'],
        order: { display_name: 'ASC' },
      });
    });
  });

  describe('getSupportFileById', () => {
    it('should return support file by id', async () => {
      const mockSupportFile = {
        support_file_id: 1,
        name: 'test-file.pdf',
        display_name: 'Test File',
        category: 'appendices',
        file_path: 'soportes-de-interes/test-file.pdf',
      };

      mockSupportFileRepository.findOne.mockResolvedValue(mockSupportFile);

      const result = await service.getSupportFileById(1);

      expect(result).toEqual(mockSupportFile);
    });

    it('should throw NotFoundException for non-existing file', async () => {
      mockSupportFileRepository.findOne.mockResolvedValue(null);

      await expect(service.getSupportFileById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createSupportFile', () => {
    it('should create a new support file', async () => {
      const mockSupportFileData = {
        name: 'new-file.pdf',
        display_name: 'New File',
        category: 'appendices',
        file_path: 'soportes-de-interes/new-file.pdf',
      };

      const mockCreatedFile = {
        support_file_id: 1,
        ...mockSupportFileData,
      };

      mockSupportFileRepository.findOne.mockResolvedValue(null); // No existing file
      mockSupportFileRepository.create.mockReturnValue(mockCreatedFile);
      mockSupportFileRepository.save.mockResolvedValue(mockCreatedFile);

      const result = await service.createSupportFile(mockSupportFileData);

      expect(result).toEqual(mockCreatedFile);
    });

    it('should throw BadRequestException for missing required fields', async () => {
      const invalidData = {
        name: '',
        display_name: 'Test',
      };

      await expect(service.createSupportFile(invalidData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for duplicate name', async () => {
      const mockSupportFileData = {
        name: 'existing-file.pdf',
        display_name: 'Existing File',
        category: 'appendices',
        file_path: 'soportes-de-interes/existing-file.pdf',
      };

      const existingFile = {
        support_file_id: 1,
        name: 'existing-file.pdf',
      };

      mockSupportFileRepository.findOne.mockResolvedValue(existingFile);

      await expect(service.createSupportFile(mockSupportFileData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateSupportFile', () => {
    it('should update an existing support file', async () => {
      const mockExistingFile = {
        support_file_id: 1,
        name: 'old-file.pdf',
        display_name: 'Old File',
        category: 'appendices',
        file_path: 'soportes-de-interes/old-file.pdf',
      };

      const updateData = {
        display_name: 'Updated File',
        category: 'dossier',
      };

      const mockUpdatedFile = {
        ...mockExistingFile,
        ...updateData,
      };

      mockSupportFileRepository.findOne.mockResolvedValue(mockExistingFile);
      mockSupportFileRepository.merge.mockReturnValue(mockUpdatedFile);
      mockSupportFileRepository.save.mockResolvedValue(mockUpdatedFile);

      const result = await service.updateSupportFile(1, updateData);

      expect(result).toEqual(mockUpdatedFile);
    });
  });

  describe('deleteSupportFile', () => {
    it('should delete an existing support file', async () => {
      const mockExistingFile = {
        support_file_id: 1,
        name: 'file-to-delete.pdf',
        display_name: 'File to Delete',
        category: 'appendices',
        file_path: 'soportes-de-interes/file-to-delete.pdf',
      };

      mockSupportFileRepository.findOne.mockResolvedValue(mockExistingFile);
      mockSupportFileRepository.remove.mockResolvedValue(mockExistingFile);

      await service.deleteSupportFile(1);

      expect(mockSupportFileRepository.remove).toHaveBeenCalledWith(mockExistingFile);
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { category: 'appendices' },
          { category: 'dossier' },
          { category: 'contractors-manual' },
        ]),
      };

      mockSupportFileRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getCategories();

      expect(result).toEqual(['appendices', 'dossier', 'contractors-manual']);
    });
  });
});