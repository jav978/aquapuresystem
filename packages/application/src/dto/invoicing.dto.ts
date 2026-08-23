import { z } from 'zod';
import { InvoiceStatus, PaymentMethod, PaymentStatus, ReturnStatus, ReturnCondition } from '@aquasystem/shared-kernel';

export const CreateInvoiceCommandSchema = z.object({
  saleId: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    discount: z.number().nonnegative().default(0),
    taxRate: z.number().nonnegative().default(21),
  })).min(1, 'At least one item required'),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
});

export type CreateInvoiceCommand = z.infer<typeof CreateInvoiceCommandSchema>;

export const InvoiceQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  customerId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  saleId: z.string().uuid().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
});

export type InvoiceQuery = z.infer<typeof InvoiceQuerySchema>;

export const InvoiceDtoSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string(),
  saleId: z.string().uuid().nullable(),
  customerId: z.string().uuid(),
  customerName: z.string(),
  userId: z.string().uuid(),
  userName: z.string(),
  status: z.nativeEnum(InvoiceStatus),
  items: z.array(z.object({
    id: z.string(),
    productId: z.string().uuid(),
    productName: z.string(),
    quantity: z.number().int(),
    unitPrice: z.number(),
    discount: z.number(),
    taxRate: z.number(),
    total: z.number(),
  })),
  subtotal: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  paidAmount: z.number(),
  pendingAmount: z.number(),
  isFullyPaid: z.boolean(),
  isOverdue: z.boolean(),
  payments: z.array(z.object({
    id: z.string(),
    paymentNumber: z.string(),
    amount: z.number(),
    method: z.nativeEnum(PaymentMethod),
    reference: z.string().nullable(),
    status: z.nativeEnum(PaymentStatus),
    paidAt: z.date().nullable(),
    createdAt: z.date(),
  })),
  issueDate: z.date(),
  dueDate: z.date().nullable(),
  paidDate: z.date().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InvoiceDto = z.infer<typeof InvoiceDtoSchema>;

export const InvoiceDetailDtoSchema = InvoiceDtoSchema.extend({
  customer: z.object({
    id: z.string().uuid(),
    code: z.string(),
    name: z.string(),
    email: z.string().email().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    taxId: z.string().nullable(),
  }),
});

export type InvoiceDetailDto = z.infer<typeof InvoiceDetailDtoSchema>;

export const AddPaymentCommandSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().optional(),
});

export type AddPaymentCommand = z.infer<typeof AddPaymentCommandSchema>;

export const CreateReturnCommandSchema = z.object({
  invoiceId: z.string().uuid(),
  customerId: z.string().uuid(),
  userId: z.string().uuid(),
  reason: z.string().min(1, 'Reason is required'),
  items: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    reason: z.string().min(1, 'Reason is required'),
    condition: z.nativeEnum(ReturnCondition),
  })).min(1, 'At least one item required'),
});

export type CreateReturnCommand = z.infer<typeof CreateReturnCommandSchema>;

export const ProcessReturnCommandSchema = z.object({
  returnId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'process', 'refund']),
  reason: z.string().optional(),
});

export type ProcessReturnCommand = z.infer<typeof ProcessReturnCommandSchema>;

export const ReturnQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  customerId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
  status: z.nativeEnum(ReturnStatus).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
});

export type ReturnQuery = z.infer<typeof ReturnQuerySchema>;

export const ReturnDtoSchema = z.object({
  id: z.string().uuid(),
  returnNumber: z.string(),
  invoiceId: z.string().uuid(),
  invoiceNumber: z.string(),
  customerId: z.string().uuid(),
  customerName: z.string(),
  userId: z.string().uuid(),
  userName: z.string(),
  status: z.nativeEnum(ReturnStatus),
  reason: z.string(),
  items: z.array(z.object({
    id: z.string(),
    productId: z.string().uuid(),
    productName: z.string(),
    quantity: z.number().int(),
    unitPrice: z.number(),
    reason: z.string(),
    condition: z.nativeEnum(ReturnCondition),
    total: z.number(),
  })),
  total: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ReturnDto = z.infer<typeof ReturnDtoSchema>;