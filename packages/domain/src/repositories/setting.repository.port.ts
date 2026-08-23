import { PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: SettingType;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum SettingType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
  COLOR = 'COLOR',
}

export interface SettingRepositoryPort {
  findById(id: string): Promise<SystemSetting | null>;
  findByKey(key: string): Promise<SystemSetting | null>;
  save(setting: SystemSetting): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(params: PaginationParams, criteria?: SettingSearchCriteria): Promise<PaginatedResult<SystemSetting>>;
  findPublic(): Promise<SystemSetting[]>;
}

export interface SettingSearchCriteria {
  isPublic?: boolean;
  search?: string;
}