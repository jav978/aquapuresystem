import { Sale } from '../entities/sale';
import { SaleId } from '../value-objects/ids';
import { CustomerId, UserId } from '../value-objects/ids';
import { PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';
import { SaleStatus } from '@aquasystem/shared-kernel';

export interface SaleRepositoryPort {
  findById(id: SaleId): Promise<Sale | null>;
  findByNumber(saleNumber: string): Promise<Sale | null>;
  save(sale: Sale): Promise<void>;
  delete(id: SaleId): Promise<void>;
  findAll(params: PaginationParams, criteria?: SaleSearchCriteria): Promise<PaginatedResult<Sale>>;
  findByCustomer(customerId: CustomerId, params: PaginationParams): Promise<PaginatedResult<Sale>>;
  findByUser(userId: UserId, params: PaginationParams): Promise<PaginatedResult<Sale>>;
  findByStatus(status: SaleStatus, params: PaginationParams): Promise<PaginatedResult<Sale>>;
}

export interface SaleSearchCriteria {
  customerId?: CustomerId;
  userId?: UserId;
  status?: SaleStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}