import { Product } from '../entities/product';
import { ProductId } from '../value-objects/ids';
import { SKU } from '../value-objects/sku';
import { PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';

export interface ProductRepositoryPort {
  findById(id: ProductId): Promise<Product | null>;
  findBySku(sku: SKU): Promise<Product | null>;
  save(product: Product): Promise<void>;
  delete(id: ProductId): Promise<void>;
  findAll(params: PaginationParams, criteria?: ProductSearchCriteria): Promise<PaginatedResult<Product>>;
  findLowStock(minStockThreshold?: number): Promise<Product[]>;
  findByCategory(category: string): Promise<Product[]>;
}

export interface ProductSearchCriteria {
  category?: string;
  isActive?: boolean;
  search?: string;
  lowStock?: boolean;
}