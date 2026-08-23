import { Result, ValidationError, DomainError } from '@aquasystem/shared-kernel';

export abstract class ValueObject<T> {
  protected constructor(protected readonly _value: T) {}

  get value(): T {
    return this._value;
  }

  equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) return false;
    if (!(other instanceof this.constructor)) return false;
    return this._value === other._value;
  }

  toString(): string {
    return String(this._value);
  }
}

export abstract class ValueObjectFactory<T, V extends ValueObject<T>> {
  abstract create(value: T): Result<V, ValidationError>;
  abstract createUnsafe(value: T): V;
}