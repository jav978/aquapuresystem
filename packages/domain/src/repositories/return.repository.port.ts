import { Return } from '../entities/return';
import { ReturnId, InvoiceId, CustomerId } from '../value-objects/ids';
import { PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';
import { ReturnStatus } from '@aquasystem/shared-kernel';

export interface ReturnRepositoryPort {
  findById(id: ReturnId): Promise<Return | null>;
  findByNumber(returnNumber: string): Promise<Return | null>;
  findByInvoiceId(invoiceId: InvoiceId): Promise<Return[]>;
  save(returnEntity: Return): Promise<void>;
  delete(id: ReturnId): Promise<void>;
  findAll(params: PaginationParams, criteria?: ReturnSearchCriteria): Promise<PaginatedResult<Return>>;
  findByCustomer(customerId: CustomerId, params: PaginationParams): Promise<PaginatedResult<Return>>;
  findByStatus(status: ReturnStatus, params: PaginationParams): Promise<PaginatedResult<Return>>;
}

export interface ReturnSearchCriteria {
  customerId?: CustomerId;
  invoiceId?: InvoiceId;
  status?: ReturnStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}