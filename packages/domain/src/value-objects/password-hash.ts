import { ValueObject } from './base';
import { Result, ValidationError } from '@aquasystem/shared-kernel';

export class PasswordHash extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static fromHash(hash: string): PasswordHash {
    return new PasswordHash(hash);
  }

  static create(hashedPassword: string): Result<PasswordHash, ValidationError> {
    if (!hashedPassword || typeof hashedPassword !== 'string') {
      return Result.fail(new ValidationError('Password hash is required'));
    }
    if (hashedPassword.length < 60) {
      return Result.fail(new ValidationError('Invalid password hash'));
    }
    return Result.ok(new PasswordHash(hashedPassword));
  }
}