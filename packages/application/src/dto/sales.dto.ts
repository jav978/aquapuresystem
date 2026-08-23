import { z } from 'zod';
import { SaleStatus } from '@aquasystem/shared-kernel';

export const CreateSaleCommandSchema = z.object({
  customerId: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    discount: z.number().nonnegative().default(0),
  })).min(1, 'At least one item required'),
  taxRate: z.number().nonnegative().default(21),
  discount: z.number().nonnegative().default(0),
  notes: z.string().optional(),
});

export type CreateSaleCommand = z.infer<typeof CreateSaleCommandSchema>;

export const UpdateSaleCommandSchema = z.object({
  id: z.string().uuid(),
  items: z.array(z.object({
    id: z.string().optional(),
    productId: z.string().uuid(),
    productName: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    discount: z.number().nonnegative().default(0),
  })).optional(),
  discount: z.number().nonnegative().optional(),
  notes: z.string().nullable().optional(),
});

export type UpdateSaleCommand = z.infer<typeof UpdateSaleCommandSchema>;

export const SaleQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  customerId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.nativeEnum(SaleStatus).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
});

export type SaleQuery = z.infer<typeof SaleQuerySchema>;

export const SaleDtoSchema = z.object({
  id: z.string().uuid(),
  saleNumber: z.string(),
  customerId: z.string().uuid(),
  customerName: z.string(),
  userId: z.string().uuid(),
  userName: z.string(),
  status: z.nativeEnum(SaleStatus),
  items: z.array(z.object({
    id: z.string(),
    productId: z.string().uuid(),
    productName: z.string(),
    quantity: z.number().int(),
    unitPrice: z.number(),
    discount: z.number(),
    total: z.number(),
  })),
  subtotal: z.number(),
  taxAmount: z.number(),
  discount: z.number(),
  total: z.number(),
  notes: z.string().nullable(),
  saleDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SaleDto = z.infer<typeof SaleDtoSchema>;

export const SaleItemDtoSchema = z.object({
  id: z.string(),
  productId: z.string().uuid(),
  productName: z.string(),
  quantity: z.number().int(),
  unitPrice: z.number(),
  discount: z.number(),
  total: z.number(),
});

export type SaleItemDto = z.infer<typeof SaleItemDtoSchema>;