import { z } from 'zod';
import { SettingType } from '@aquasystem/domain';

export const GetSettingsQuerySchema = z.object({
  isPublic: z.boolean().optional(),
});

export type GetSettingsQuery = z.infer<typeof GetSettingsQuerySchema>;

export const UpdateSettingCommandSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string(),
  type: z.nativeEnum(SettingType),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export type UpdateSettingCommand = z.infer<typeof UpdateSettingCommandSchema>;

export const SettingDtoSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  type: z.nativeEnum(SettingType),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SettingDto = z.infer<typeof SettingDtoSchema>;

export const AuditLogQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;

export const AuditLogDtoSchema = z.object({
  id: z.string(),
  userId: z.string().uuid().nullable(),
  userName: z.string().nullable(),
  action: z.string(),
  entity: z.string(),
  entityId: z.string().nullable(),
  oldData: z.record(z.unknown()).nullable(),
  newData: z.record(z.unknown()).nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.date(),
});

export type AuditLogDto = z.infer<typeof AuditLogDtoSchema>;