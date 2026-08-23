import { Invoice } from '../entities/invoice';
import { InvoiceId, SaleId, CustomerId, UserId } from '../value-objects/ids';
import { PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';
import { InvoiceStatus } from '@aquasystem/shared-kernel';

export interface InvoiceRepositoryPort {
  findById(id: InvoiceId): Promise<Invoice | null>;
  findByNumber(invoiceNumber: string): Promise<Invoice | null>;
  findBySaleId(saleId: SaleId): Promise<Invoice | null>;
  save(invoice: Invoice): Promise<void>;
  delete(id: InvoiceId): Promise<void>;
  findAll(params: PaginationParams, criteria?: InvoiceSearchCriteria): Promise<PaginatedResult<Invoice>>;
  findByCustomer(customerId: CustomerId, params: PaginationParams): Promise<PaginatedResult<Invoice>>;
  findByStatus(status: InvoiceStatus, params: PaginationParams): Promise<PaginatedResult<Invoice>>;
  findOverdue(params: PaginationParams): Promise<PaginatedResult<Invoice>>;
  findByDateRange(dateFrom: Date, dateTo: Date, params: PaginationParams): Promise<PaginatedResult<Invoice>>;
}

export interface InvoiceSearchCriteria {
  customerId?: CustomerId;
  userId?: UserId;
  status?: InvoiceStatus;
  saleId?: SaleId;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}