import { ValueObject } from './base';
import { Result, ValidationError } from '@aquasystem/shared-kernel';

export class Money extends ValueObject<number> {
  private constructor(value: number) {
    super(Math.round(value * 100) / 100);
  }

  static create(amount: number): Result<Money, ValidationError> {
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
      return Result.fail(new ValidationError('Amount must be a valid number'));
    }
    if (!Number.isFinite(amount)) {
      return Result.fail(new ValidationError('Amount must be finite'));
    }
    if (amount < 0) {
      return Result.fail(new ValidationError('Amount cannot be negative'));
    }
    if (amount > 999999999.99) {
      return Result.fail(new ValidationError('Amount too large'));
    }
    return Result.ok(new Money(amount));
  }

  static createUnsafe(amount: number): Money {
    return Money.create(amount).unwrap();
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    return new Money(this._value + other._value);
  }

  subtract(other: Money): Result<Money, ValidationError> {
    const result = this._value - other._value;
    if (result < 0) {
      return Result.fail(new ValidationError('Insufficient funds'));
    }
    return Result.ok(new Money(result));
  }

  multiply(factor: number): Result<Money, ValidationError> {
    if (factor < 0) {
      return Result.fail(new ValidationError('Factor cannot be negative'));
    }
    return Result.ok(new Money(this._value * factor));
  }

  divide(divisor: number): Result<Money, ValidationError> {
    if (divisor <= 0) {
      return Result.fail(new ValidationError('Divisor must be positive'));
    }
    return Result.ok(new Money(this._value / divisor));
  }

  percentage(percent: number): Result<Money, ValidationError> {
    return this.multiply(percent / 100);
  }

  get cents(): number {
    return Math.round(this._value * 100);
  }

  toString(): string {
    return this._value.toFixed(2);
  }
}