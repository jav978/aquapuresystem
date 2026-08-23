import { ValueObject } from './base';
import { generateId } from '@aquasystem/shared-kernel';

export abstract class EntityId<T extends string = string> extends ValueObject<T> {
  protected constructor(value: T) {
    super(value);
  }

  static generate<T extends string = string>(): EntityId<T> {
    return new (this as any)(generateId() as T);
  }
}

export class UserId extends EntityId<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(id: string): UserId {
    return new UserId(id);
  }

  static generate(): UserId {
    return new UserId(generateId());
  }
}

export class ProductId extends EntityId<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(id: string): ProductId {
    return new ProductId(id);
  }

  static generate(): ProductId {
    return new ProductId(generateId());
  }
}

export class CustomerId extends EntityId<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(id: string): CustomerId {
    return new CustomerId(id);
  }

  static generate(): CustomerId {
    return new CustomerId(generateId());
  }
}

export class WarehouseId extends EntityId<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(id: string): WarehouseId {
    return new WarehouseId(id);
  }

  static generate(): WarehouseId {
    return new WarehouseId(generateId());
  }
}

export class SaleId extends EntityId<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(id: string): SaleId {
    return new SaleId(id);
  }

  static generate(): SaleId {
    return new SaleId(generateId());
  }
}

export class InvoiceId extends EntityId<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(id: string): InvoiceId {
    return new InvoiceId(id);
  }

  static generate(): InvoiceId {
    return new InvoiceId(generateId());
  }
}

export class ReturnId extends EntityId<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(id: string): ReturnId {
    return new ReturnId(id);
  }

  static generate(): ReturnId {
    return new ReturnId(generateId());
  }
}

export class PaymentId extends EntityId<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(id: string): PaymentId {
    return new PaymentId(id);
  }

  static generate(): PaymentId {
    return new PaymentId(generateId());
  }
}

export class SettingId extends EntityId<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(id: string): SettingId {
    return new SettingId(id);
  }

  static generate(): SettingId {
    return new SettingId(generateId());
  }
}