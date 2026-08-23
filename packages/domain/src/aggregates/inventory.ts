import { AggregateRoot } from '../entities/base';
import { ProductId, WarehouseId } from '../value-objects/ids';
import { Quantity } from '../value-objects/quantity';
import { Result, DomainError, BusinessRuleError } from '@aquasystem/shared-kernel';

interface InventoryItemProps {
  productId: ProductId;
  warehouseId: WarehouseId;
  quantity: Quantity;
  reservedQuantity: Quantity;
}

export class InventoryItem {
  constructor(
    public readonly productId: ProductId,
    public readonly warehouseId: WarehouseId,
    private _quantity: Quantity,
    private _reservedQuantity: Quantity
  ) {}

  static create(
    productId: ProductId,
    warehouseId: WarehouseId,
    quantity: Quantity = Quantity.zero()
  ): InventoryItem {
    return new InventoryItem(productId, warehouseId, quantity, Quantity.zero());
  }

  get quantity(): Quantity {
    return this._quantity;
  }

  get reservedQuantity(): Quantity {
    return this._reservedQuantity;
  }

  get availableQuantity(): Quantity {
    return this._quantity.subtract(this._reservedQuantity).unwrap();
  }

  addStock(quantity: Quantity): void {
    this._quantity = this._quantity.add(quantity);
  }

  removeStock(quantity: Quantity): Result<void, DomainError> {
    const result = this._quantity.subtract(quantity);
    if (!result.ok) return result;
    this._quantity = result.value;
    return Result.ok(undefined);
  }

  reserve(quantity: Quantity): Result<void, DomainError> {
    const available = this.availableQuantity;
    const result = available.subtract(quantity);
    if (!result.ok) {
      return Result.fail(new BusinessRuleError('Insufficient available stock for reservation'));
    }
    this._reservedQuantity = this._reservedQuantity.add(quantity);
    return Result.ok(undefined);
  }

  releaseReservation(quantity: Quantity): Result<void, DomainError> {
    const result = this._reservedQuantity.subtract(quantity);
    if (!result.ok) return result;
    this._reservedQuantity = result.value;
    return Result.ok(undefined);
  }

  confirmReservation(quantity: Quantity): Result<void, DomainError> {
    const result = this._reservedQuantity.subtract(quantity);
    if (!result.ok) return result;
    this._reservedQuantity = result.value;
    this._quantity = this._quantity.subtract(quantity).unwrap();
    return Result.ok(undefined);
  }

  toProps(): InventoryItemProps {
    return {
      productId: this.productId,
      warehouseId: this.warehouseId,
      quantity: this._quantity,
      reservedQuantity: this._reservedQuantity,
    };
  }
}

interface InventoryProps {
  items: InventoryItem[];
}

export class Inventory extends AggregateRoot<WarehouseId> {
  private constructor(
    warehouseId: WarehouseId,
    private _items: Map<string, InventoryItem>
  ) {
    super(warehouseId);
  }

  static create(warehouseId: WarehouseId): Inventory {
    return new Inventory(warehouseId, new Map());
  }

  static reconstitute(props: InventoryProps): Inventory {
    const items = new Map<string, InventoryItem>();
    for (const item of props.items) {
      items.set(`${item.productId.value}-${item.warehouseId.value}`, item);
    }
    return new Inventory(props.items[0]?.warehouseId || WarehouseId.generate(), items);
  }

  get warehouseId(): WarehouseId {
    return this.id;
  }

  get items(): InventoryItem[] {
    return Array.from(this._items.values());
  }

  getItem(productId: ProductId): InventoryItem | undefined {
    return this._items.get(`${productId.value}-${this.id.value}`);
  }

  getOrCreateItem(productId: ProductId): InventoryItem {
    const key = `${productId.value}-${this.id.value}`;
    let item = this._items.get(key);
    if (!item) {
      item = InventoryItem.create(productId, this.id);
      this._items.set(key, item);
    }
    return item;
  }

  addStock(productId: ProductId, quantity: Quantity): void {
    const item = this.getOrCreateItem(productId);
    item.addStock(quantity);
    this.addDomainEvent(new StockAdjustedEvent(this.id, productId, quantity, 'IN'));
  }

  removeStock(productId: ProductId, quantity: Quantity): Result<void, DomainError> {
    const item = this.getItem(productId);
    if (!item) {
      return Result.fail(new BusinessRuleError('Product not found in inventory'));
    }
    const result = item.removeStock(quantity);
    if (!result.ok) return result;
    this.addDomainEvent(new StockAdjustedEvent(this.id, productId, quantity, 'OUT'));
    return Result.ok(undefined);
  }

  reserveStock(productId: ProductId, quantity: Quantity): Result<void, DomainError> {
    const item = this.getItem(productId);
    if (!item) {
      return Result.fail(new BusinessRuleError('Product not found in inventory'));
    }
    return item.reserve(quantity);
  }

  releaseReservation(productId: ProductId, quantity: Quantity): Result<void, DomainError> {
    const item = this.getItem(productId);
    if (!item) {
      return Result.fail(new BusinessRuleError('Product not found in inventory'));
    }
    return item.releaseReservation(quantity);
  }

  confirmReservation(productId: ProductId, quantity: Quantity): Result<void, DomainError> {
    const item = this.getItem(productId);
    if (!item) {
      return Result.fail(new BusinessRuleError('Product not found in inventory'));
    }
    return item.confirmReservation(quantity);
  }

  getAvailableQuantity(productId: ProductId): Quantity {
    const item = this.getItem(productId);
    return item?.availableQuantity || Quantity.zero();
  }

  getTotalQuantity(productId: ProductId): Quantity {
    const item = this.getItem(productId);
    return item?.quantity || Quantity.zero();
  }

  isLowStock(productId: ProductId, minStock: Quantity): boolean {
    return this.getAvailableQuantity(productId)._value <= minStock._value;
  }
}

export class StockAdjustedEvent implements DomainEvent {
  readonly eventType = 'StockAdjusted';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly warehouseId: WarehouseId,
    public readonly productId: ProductId,
    public readonly quantity: Quantity,
    public readonly type: 'IN' | 'OUT'
  ) {
    this.occurredAt = new Date();
    this.aggregateId = warehouseId.value;
  }
}

export type DomainEvent = {
  eventType: string;
  occurredAt: Date;
  aggregateId: string;
};