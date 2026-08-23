import { User } from '../entities/user';
import { UserId } from '../value-objects/ids';
import { Email } from '../value-objects/email';
import { PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';

export interface UserRepositoryPort {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
  findAll(params: PaginationParams, criteria?: UserSearchCriteria): Promise<PaginatedResult<User>>;
}

export interface UserSearchCriteria {
  role?: string;
  isActive?: boolean;
  search?: string;
}