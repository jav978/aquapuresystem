import { ValueObject } from './base';
import { Result, ValidationError } from '@aquasystem/shared-kernel';

export class Quantity extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(quantity: number): Result<Quantity, ValidationError> {
    if (!Number.isInteger(quantity)) {
      return Result.fail(new ValidationError('Quantity must be an integer'));
    }
    if (quantity < 0) {
      return Result.fail(new ValidationError('Quantity cannot be negative'));
    }
    if (quantity > 999999) {
      return Result.fail(new ValidationError('Quantity too large'));
    }
    return Result.ok(new Quantity(quantity));
  }

  static createUnsafe(quantity: number): Quantity {
    return Quantity.create(quantity).unwrap();
  }

  static zero(): Quantity {
    return new Quantity(0);
  }

  add(other: Quantity): Quantity {
    return new Quantity(this._value + other._value);
  }

  subtract(other: Quantity): Result<Quantity, ValidationError> {
    const result = this._value - other._value;
    if (result < 0) {
      return Result.fail(new ValidationError('Insufficient quantity'));
    }
    return Result.ok(new Quantity(result));
  }

  isZero(): boolean {
    return this._value === 0;
  }

  isPositive(): boolean {
    return this._value > 0;
  }
}