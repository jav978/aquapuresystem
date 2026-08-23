export * from './user.repository.port';
export * from './product.repository.port';
export * from './customer.repository.port';
export * from './warehouse.repository.port';
export * from './sale.repository.port';
export * from './invoice.repository.port';
export * from './return.repository.port';
export * from './setting.repository.port';
export * from './inventory-movement.repository.port';

export interface RepositoryPort<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface SearchableRepositoryPort<T> extends RepositoryPort<T> {
  findAll(params: { page: number; limit: number }, criteria?: Record<string, any>): Promise<{
    data: T[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
}