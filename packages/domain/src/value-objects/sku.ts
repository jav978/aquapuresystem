import { ValueObject } from './base';
import { Result, ValidationError } from '@aquasystem/shared-kernel';
import { REGEX_PATTERNS } from '@aquasystem/shared-kernel';

export class SKU extends ValueObject<string> {
  private constructor(value: string) {
    super(value.toUpperCase());
  }

  static create(sku: string): Result<SKU, ValidationError> {
    if (!sku || typeof sku !== 'string') {
      return Result.fail(new ValidationError('SKU is required'));
    }
    const trimmed = sku.trim().toUpperCase();
    if (!REGEX_PATTERNS.SKU.test(trimmed)) {
      return Result.fail(new ValidationError('Invalid SKU format. Expected: XX-123456'));
    }
    return Result.ok(new SKU(trimmed));
  }

  static createUnsafe(sku: string): SKU {
    return SKU.create(sku).unwrap();
  }
}