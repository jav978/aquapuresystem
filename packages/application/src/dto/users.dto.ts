import { z } from 'zod';
import { UserRole } from '@aquasystem/shared-kernel';

export const InviteUserCommandSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  role: z.nativeEnum(UserRole).default(UserRole.OPERATOR),
});

export type InviteUserCommand = z.infer<typeof InviteUserCommandSchema>;

export const UpdateUserRoleCommandSchema = z.object({
  userId: z.string().uuid(),
  newRole: z.nativeEnum(UserRole),
  changedBy: z.string().uuid(),
});

export type UpdateUserRoleCommand = z.infer<typeof UpdateUserRoleCommandSchema>;

export const DeactivateUserCommandSchema = z.object({
  userId: z.string().uuid(),
  deactivatedBy: z.string().uuid(),
});

export type DeactivateUserCommand = z.infer<typeof DeactivateUserCommandSchema>;

export const UserQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

export type UserQuery = z.infer<typeof UserQuerySchema>;

export const UserDtoSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
  lastLoginAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserDto = z.infer<typeof UserDtoSchema>;