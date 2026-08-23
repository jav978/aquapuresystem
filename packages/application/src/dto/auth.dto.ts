import { z } from 'zod';
import { UserRole } from '@aquasystem/shared-kernel';

export const LoginCommandSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginCommand = z.infer<typeof LoginCommandSchema>;

export const LoginResultSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    fullName: z.string(),
    role: z.nativeEnum(UserRole),
    isActive: z.boolean(),
  }),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export type LoginResult = z.infer<typeof LoginResultSchema>;

export const RegisterCommandSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  role: z.nativeEnum(UserRole).optional(),
});

export type RegisterCommand = z.infer<typeof RegisterCommandSchema>;

export const ForgotPasswordCommandSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export type ForgotPasswordCommand = z.infer<typeof ForgotPasswordCommandSchema>;

export const VerifyCodeCommandSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export type VerifyCodeCommand = z.infer<typeof VerifyCodeCommandSchema>;

export const ResetPasswordCommandSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().length(6, 'Code must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordCommand = z.infer<typeof ResetPasswordCommandSchema>;

export const RefreshTokenCommandSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenCommand = z.infer<typeof RefreshTokenCommandSchema>;

export const RefreshTokenResultSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
});

export type RefreshTokenResult = z.infer<typeof RefreshTokenResultSchema>;

export const UserDtoSchema = z.object({
  id: z.string(),
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