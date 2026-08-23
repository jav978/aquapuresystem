import { ValueObject, ValueObjectFactory } from './base';
import { REGEX_PATTERNS, ValidationError } from '@aquasystem/shared-kernel';
import { Result } from '@aquasystem/shared-kernel';

export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value.toLowerCase().trim());
  }

  static create(email: string): Result<Email, ValidationError> {
    if (!email || typeof email !== 'string') {
      return Result.fail(new ValidationError('Email is required'));
    }
    const trimmed = email.trim().toLowerCase();
    if (!REGEX_PATTERNS.EMAIL.test(trimmed)) {
      return Result.fail(new ValidationError('Invalid email format'));
    }
    if (trimmed.length > 254) {
      return Result.fail(new ValidationError('Email too long'));
    }
    return Result.ok(new Email(trimmed));
  }

  static createUnsafe(email: string): Email {
    return Email.create(email).unwrap();
  }

  get domain(): string {
    return this._value.split('@')[1];
  }

  get localPart(): string {
    return this._value.split('@')[0];
  }
}