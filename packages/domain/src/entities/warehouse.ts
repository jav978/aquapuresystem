import { AggregateRoot } from './base';
import { WarehouseId } from '../value-objects/ids';
import { Result, DomainError, ValidationError } from '@aquasystem/shared-kernel';

interface WarehouseProps {
  id: WarehouseId;
  name: string;
  code: string;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateWarehouseData {
  name: string;
  code: string;
  address?: string;
}

export class Warehouse extends AggregateRoot<WarehouseId> {
  private constructor(
    id: WarehouseId,
    private _name: string,
    private readonly _code: string,
    private _address: string | null,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  static create(data: CreateWarehouseData): Result<Warehouse, DomainError> {
    if (!data.name || data.name.trim().length === 0) {
      return Result.fail(new ValidationError('Warehouse name is required'));
    }
    if (!data.code || data.code.trim().length === 0) {
      return Result.fail(new ValidationError('Warehouse code is required'));
    }

    const warehouse = new Warehouse(
      WarehouseId.generate(),
      data.name.trim(),
      data.code.trim().toUpperCase(),
      data.address?.trim() || null,
      true,
      new Date(),
      new Date()
    );

    warehouse.addDomainEvent(new WarehouseCreatedEvent(warehouse.id, warehouse.code, warehouse.name));
    return Result.ok(warehouse);
  }

  static reconstitute(props: WarehouseProps): Warehouse {
    return new Warehouse(
      props.id,
      props.name,
      props.code,
      props.address,
      props.isActive,
      props.createdAt,
      props.updatedAt
    );
  }

  get name(): string {
    return this._name;
  }

  get code(): string {
    return this._code;
  }

  get address(): string | null {
    return this._address;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateDetails(name: string, address?: string): Result<void, DomainError> {
    if (!name || name.trim().length === 0) {
      return Result.fail(new ValidationError('Warehouse name is required'));
    }
    this._name = name.trim();
    if (address !== undefined) {
      this._address = address.trim() || null;
    }
    this._updatedAt = new Date();
    this.addDomainEvent(new WarehouseUpdatedEvent(this.id));
    return Result.ok(undefined);
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }
}

export class WarehouseCreatedEvent implements DomainEvent {
  readonly eventType = 'WarehouseCreated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly warehouseId: WarehouseId,
    public readonly code: string,
    public readonly name: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = warehouseId.value;
  }
}

export class WarehouseUpdatedEvent implements DomainEvent {
  readonly eventType = 'WarehouseUpdated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(public readonly warehouseId: WarehouseId) {
    this.occurredAt = new Date();
    this.aggregateId = warehouseId.value;
  }
}