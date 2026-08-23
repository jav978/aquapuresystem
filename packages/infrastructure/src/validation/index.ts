import { z } from 'zod';
import { Result, ValidationError } from '@aquasystem/shared-kernel';

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): Result<T, ValidationError> {
  const result = schema.safeParse(data);
  if (result.success) {
    return Result.ok(result.data);
  }
  const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
  return Result.fail(new ValidationError(errors));
}

export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): Result<T, ValidationError> => validateSchema(schema, data);
}

// Common validation schemas
export const idSchema = z.string().uuid('Invalid ID format');

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const dateRangeSchema = z.object({
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
}).refine(
  (data) => !data.dateFrom || !data.dateTo || data.dateFrom <= data.dateTo,
  { message: 'dateFrom must be before dateTo', path: ['dateFrom'] }
);

export const emailSchema = z.string().email('Invalid email format');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[@$!%*?&]/, 'Password must contain at least one special character');

export const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name too long');

export const skuSchema = z.string().regex(/^[A-Z]{2,4}-\d{4,6}$/i, 'Invalid SKU format');

export const moneySchema = z.number().nonnegative('Amount cannot be negative').finite('Amount must be finite');

export const quantitySchema = z.number().int().nonnegative('Quantity cannot be negative');