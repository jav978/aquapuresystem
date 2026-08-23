import { Result } from '@aquasystem/shared-kernel';
import { User } from '@aquasystem/domain';

export interface TokenGeneratorPort {
  generateAccessToken(user: User): Promise<string>;
  generateRefreshToken(user: User): Promise<string>;
  verifyAccessToken(token: string): Promise<Result<TokenPayload>>;
  verifyRefreshToken(token: string): Promise<Result<TokenPayload>>;
  refreshAccessToken(refreshToken: string): Promise<Result<string>>;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface PasswordHasherPort {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export interface EventBusPort {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): Promise<void>;
}

export interface DomainEvent {
  eventType: string;
  occurredAt: Date;
  aggregateId: string;
  [key: string]: any;
}

export type EventHandler = (event: DomainEvent) => Promise<void>;

export interface EmailPort {
  send(to: string, subject: string, html: string, text?: string): Promise<Result<void>>;
  sendTemplate(to: string, templateId: string, data: Record<string, any>): Promise<Result<void>>;
}

export interface StoragePort {
  upload(key: string, data: Buffer, contentType: string): Promise<Result<string>>;
  download(key: string): Promise<Result<Buffer>>;
  delete(key: string): Promise<Result<void>>;
  getUrl(key: string): Promise<string>;
}

export interface NotificationPort {
  send(userId: string, notification: Notification): Promise<Result<void>>;
  sendBulk(userIds: string[], notification: Notification): Promise<Result<void>>;
}

export interface Notification {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}