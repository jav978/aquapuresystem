import { z } from 'zod';
import { ProductCategory, UnitOfMeasure, MovementType } from '@aquasystem/shared-kernel';

export const CreateProductCommandSchema = z.object({
  sku: z.string().regex(/^[A-Z]{2,4}-\d{4,6}$/i, 'Invalid SKU format'),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  category: z.nativeEnum(ProductCategory),
  unit: z.nativeEnum(UnitOfMeasure),
  price: z.number().positive('Price must be positive'),
  cost: z.number().nonnegative('Cost cannot be negative'),
  minStock: z.number().int().nonnegative().default(0),
  maxStock: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
});

export type CreateProductCommand = z.infer<typeof CreateProductCommandSchema>;

export const UpdateProductCommandSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  unit: z.nativeEnum(UnitOfMeasure).optional(),
  price: z.number().positive().optional(),
  cost: z.number().nonnegative().optional(),
  minStock: z.number().int().nonnegative().optional(),
  maxStock: z.number().int().positive().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export type UpdateProductCommand = z.infer<typeof UpdateProductCommandSchema>;

export const ProductQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  category: z.nativeEnum(ProductCategory).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  lowStock: z.boolean().optional(),
});

export type ProductQuery = z.infer<typeof ProductQuerySchema>;

export const ProductDtoSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.nativeEnum(ProductCategory),
  unit: z.nativeEnum(UnitOfMeasure),
  price: z.number(),
  cost: z.number(),
  margin: z.number(),
  marginPercentage: z.number(),
  minStock: z.number(),
  maxStock: z.number().nullable(),
  isActive: z.boolean(),
  imageUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductDto = z.infer<typeof ProductDtoSchema>;

export const AdjustInventoryCommandSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  quantity: z.number().int(),
  reason: z.string().optional(),
  type: z.nativeEnum(MovementType),
});

export type AdjustInventoryCommand = z.infer<typeof AdjustInventoryCommandSchema>;

export const TransferInventoryCommandSchema = z.object({
  productId: z.string().uuid(),
  fromWarehouseId: z.string().uuid(),
  toWarehouseId: z.string().uuid(),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
});

export type TransferInventoryCommand = z.infer<typeof TransferInventoryCommandSchema>;

export const InventoryMovementQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  productId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  type: z.nativeEnum(MovementType).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type InventoryMovementQuery = z.infer<typeof InventoryMovementQuerySchema>;

export const InventoryMovementDtoSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  warehouseId: z.string(),
  warehouseName: z.string(),
  type: z.nativeEnum(MovementType),
  quantity: z.number().int(),
  reason: z.string().nullable(),
  referenceId: z.string().nullable(),
  referenceType: z.string().nullable(),
  userId: z.string(),
  userName: z.string(),
  createdAt: z.date(),
});

export type InventoryMovementDto = z.infer<typeof InventoryMovementDtoSchema>;

export const LowStockAlertDtoSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  productSku: z.string(),
  warehouseId: z.string().uuid(),
  warehouseName: z.string(),
  currentStock: z.number().int(),
  minStock: z.number().int(),
  severity: z.enum(['low', 'critical']),
});

export type LowStockAlertDto = z.infer<typeof LowStockAlertDtoSchema>;