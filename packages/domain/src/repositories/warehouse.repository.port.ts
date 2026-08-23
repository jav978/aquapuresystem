import { Warehouse } from '../entities/warehouse';
import { WarehouseId } from '../value-objects/ids';
import { PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';

export interface WarehouseRepositoryPort {
  findById(id: WarehouseId): Promise<Warehouse | null>;
  findByCode(code: string): Promise<Warehouse | null>;
  save(warehouse: Warehouse): Promise<void>;
  delete(id: WarehouseId): Promise<void>;
  findAll(params: PaginationParams, criteria?: WarehouseSearchCriteria): Promise<PaginatedResult<Warehouse>>;
}

export interface WarehouseSearchCriteria {
  isActive?: boolean;
  search?: string;
}