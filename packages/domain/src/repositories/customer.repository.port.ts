import { Customer } from '../entities/customer';
import { CustomerId } from '../value-objects/ids';
import { PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';

export interface CustomerRepositoryPort {
  findById(id: CustomerId): Promise<Customer | null>;
  findByCode(code: string): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
  delete(id: CustomerId): Promise<void>;
  findAll(params: PaginationParams, criteria?: CustomerSearchCriteria): Promise<PaginatedResult<Customer>>;
  findByEmail(email: string): Promise<Customer | null>;
}

export interface CustomerSearchCriteria {
  isActive?: boolean;
  search?: string;
}