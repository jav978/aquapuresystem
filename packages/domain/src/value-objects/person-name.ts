import { ValueObject } from './base';
import { Result, ValidationError } from '@aquasystem/shared-kernel';

export class PersonName extends ValueObject<string> {
  private constructor(value: string) {
    super(value.trim());
  }

  static create(name: string): Result<PersonName, ValidationError> {
    if (!name || typeof name !== 'string') {
      return Result.fail(new ValidationError('Name is required'));
    }
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return Result.fail(new ValidationError('Name cannot be empty'));
    }
    if (trimmed.length > 100) {
      return Result.fail(new ValidationError('Name too long'));
    }
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmed)) {
      return Result.fail(new ValidationError('Name contains invalid characters'));
    }
    return Result.ok(new PersonName(trimmed));
  }

  static createUnsafe(name: string): PersonName {
    return PersonName.create(name).unwrap();
  }

  get initials(): string {
    return this._value
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}