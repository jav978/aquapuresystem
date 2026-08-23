import { REGEX_PATTERNS } from '../constants';

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isArray<T>(value: unknown, guard?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) return false;
  if (!guard) return true;
  return value.every(guard);
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export function isEmail(value: unknown): value is string {
  return isString(value) && REGEX_PATTERNS.EMAIL.test(value);
}

export function isPhone(value: unknown): value is string {
  return isString(value) && REGEX_PATTERNS.PHONE.test(value);
}

export function isUUID(value: unknown): value is string {
  return isString(value) && REGEX_PATTERNS.UUID.test(value);
}

export function isSKU(value: unknown): value is string {
  return isString(value) && REGEX_PATTERNS.SKU.test(value);
}

export function isSlug(value: unknown): value is string {
  return isString(value) && REGEX_PATTERNS.SLUG.test(value);
}

export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

export function isPositiveInteger(value: unknown): value is number {
  return isInteger(value) && value > 0;
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

export function isNotEmptyArray<T>(value: unknown, guard?: (item: unknown) => item is T): value is T[] {
  return isArray(value, guard) && value.length > 0;
}

export function hasKeys<T extends Record<string, unknown>>(
  obj: unknown,
  keys: string[]
): obj is T {
  if (!isObject(obj)) return false;
  return keys.every((key) => key in obj);
}

export function isRecordOf<T>(
  value: unknown,
  guard: (value: unknown) => value is T
): value is Record<string, T> {
  if (!isObject(value)) return false;
  return Object.values(value).every(guard);
}

export function assertIsString(value: unknown, message = 'Expected string'): asserts value is string {
  if (!isString(value)) throw new TypeError(message);
}

export function assertIsNumber(value: unknown, message = 'Expected number'): asserts value is number {
  if (!isNumber(value)) throw new TypeError(message);
}

export function assertIsPositiveNumber(value: unknown, message = 'Expected positive number'): asserts value is number {
  if (!isPositiveNumber(value)) throw new TypeError(message);
}

export function assertIsNotEmptyArray<T>(value: unknown, message = 'Expected non-empty array'): asserts value is T[] {
  if (!isNotEmptyArray(value)) throw new TypeError(message);
}