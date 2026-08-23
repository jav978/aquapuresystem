import { AggregateRoot } from './base';
import { ProductId } from '../value-objects/ids';
import { SKU } from '../value-objects/sku';
import { Money } from '../value-objects/money';
import { Quantity } from '../value-objects/quantity';
import { PersonName } from '../value-objects/person-name';
import { ProductCategory, UnitOfMeasure } from '@aquasystem/shared-kernel';
import { Result, DomainError, BusinessRuleError } from '@aquasystem/shared-kernel';

interface ProductProps {
  id: ProductId;
  sku: SKU;
  name: string;
  description: string | null;
  category: ProductCategory;
  unit: UnitOfMeasure;
  price: Money;
  cost: Money;
  minStock: Quantity;
  maxStock: Quantity | null;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateProductData {
  sku: string;
  name: string;
  description?: string;
  category: ProductCategory;
  unit: UnitOfMeasure;
  price: number;
  cost: number;
  minStock?: number;
  maxStock?: number;
  imageUrl?: string;
}

export class Product extends AggregateRoot<ProductId> {
  private constructor(
    id: ProductId,
    private readonly _sku: SKU,
    private _name: string,
    private _description: string | null,
    private _category: ProductCategory,
    private _unit: UnitOfMeasure,
    private _price: Money,
    private _cost: Money,
    private _minStock: Quantity,
    private _maxStock: Quantity | null,
    private _isActive: boolean,
    private _imageUrl: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  static create(data: CreateProductData): Result<Product, DomainError> {
    const skuResult = SKU.create(data.sku);
    if (!skuResult.ok) return Result.fail(skuResult.error);

    const nameResult = PersonName.create(data.name);
    if (!nameResult.ok) return Result.fail(nameResult.error);

    const priceResult = Money.create(data.price);
    if (!priceResult.ok) return Result.fail(priceResult.error);

    const costResult = Money.create(data.cost);
    if (!costResult.ok) return Result.fail(costResult.error);

    const minStockResult = Quantity.create(data.minStock || 0);
    if (!minStockResult.ok) return Result.fail(minStockResult.error);

    let maxStockResult = Result.ok<Quantity | null>(null);
    if (data.maxStock) {
      maxStockResult = Quantity.create(data.maxStock);
      if (!maxStockResult.ok) return Result.fail(maxStockResult.error);
    }

    const product = new Product(
      ProductId.generate(),
      skuResult.value,
      nameResult.value.value,
      data.description || null,
      data.category,
      data.unit,
      priceResult.value,
      costResult.value,
      minStockResult.value,
      maxStockResult.value,
      true,
      data.imageUrl || null,
      new Date(),
      new Date()
    );

    product.addDomainEvent(new ProductCreatedEvent(product.id, product.sku, product.name));
    return Result.ok(product);
  }

  static reconstitute(props: ProductProps): Product {
    return new Product(
      props.id,
      props.sku,
      props.name,
      props.description,
      props.category,
      props.unit,
      props.price,
      props.cost,
      props.minStock,
      props.maxStock,
      props.isActive,
      props.imageUrl,
      props.createdAt,
      props.updatedAt
    );
  }

  get sku(): SKU {
    return this._sku;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get category(): ProductCategory {
    return this._category;
  }

  get unit(): UnitOfMeasure {
    return this._unit;
  }

  get price(): Money {
    return this._price;
  }

  get cost(): Money {
    return this._cost;
  }

  get minStock(): Quantity {
    return this._minStock;
  }

  get maxStock(): Quantity | null {
    return this._maxStock;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get margin(): Money {
    return this._price.subtract(this._cost).unwrap();
  }

  get marginPercentage(): number {
    return this._price._value > 0
      ? ((this._price._value - this._cost._value) / this._price._value) * 100
      : 0;
  }

  updateDetails(data: Partial<CreateProductData>): Result<void, DomainError> {
    if (data.name) {
      const nameResult = PersonName.create(data.name);
      if (!nameResult.ok) return Result.fail(nameResult.error);
      this._name = nameResult.value.value;
    }
    if (data.description !== undefined) {
      this._description = data.description || null;
    }
    if (data.category) {
      this._category = data.category;
    }
    if (data.unit) {
      this._unit = data.unit;
    }
    if (data.price !== undefined) {
      const priceResult = Money.create(data.price);
      if (!priceResult.ok) return Result.fail(priceResult.error);
      this._price = priceResult.value;
    }
    if (data.cost !== undefined) {
      const costResult = Money.create(data.cost);
      if (!costResult.ok) return Result.fail(costResult.error);
      this._cost = costResult.value;
    }
    if (data.minStock !== undefined) {
      const minStockResult = Quantity.create(data.minStock);
      if (!minStockResult.ok) return Result.fail(minStockResult.error);
      this._minStock = minStockResult.value;
    }
    if (data.maxStock !== undefined) {
      if (data.maxStock) {
        const maxStockResult = Quantity.create(data.maxStock);
        if (!maxStockResult.ok) return Result.fail(maxStockResult.error);
        this._maxStock = maxStockResult.value;
      } else {
        this._maxStock = null;
      }
    }
    if (data.imageUrl !== undefined) {
      this._imageUrl = data.imageUrl || null;
    }
    this._updatedAt = new Date();
    this.addDomainEvent(new ProductUpdatedEvent(this.id));
    return Result.ok(undefined);
  }

  updateStock(minStock: number, maxStock?: number): Result<void, DomainError> {
    const minStockResult = Quantity.create(minStock);
    if (!minStockResult.ok) return Result.fail(minStockResult.error);

    if (maxStock !== undefined) {
      if (maxStock) {
        const maxStockResult = Quantity.create(maxStock);
        if (!maxStockResult.ok) return Result.fail(maxStockResult.error);
        this._maxStock = maxStockResult.value;
      } else {
        this._maxStock = null;
      }
    }

    this._minStock = minStockResult.value;
    this._updatedAt = new Date();
    this.addDomainEvent(new ProductStockUpdatedEvent(this.id, this._minStock, this._maxStock));
    return Result.ok(undefined);
  }

  setImageUrl(url: string | null): void {
    this._imageUrl = url;
    this._updatedAt = new Date();
    this.addDomainEvent(new ProductImageUpdatedEvent(this.id, url));
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
    this.addDomainEvent(new ProductActivatedEvent(this.id));
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
    this.addDomainEvent(new ProductDeactivatedEvent(this.id));
  }

  isLowStock(currentStock: Quantity): boolean {
    return currentStock._value <= this._minStock._value;
  }

  isOutOfStock(currentStock: Quantity): boolean {
    return currentStock.isZero();
  }
}

export class ProductCreatedEvent implements DomainEvent {
  readonly eventType = 'ProductCreated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly productId: ProductId,
    public readonly sku: SKU,
    public readonly name: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = productId.value;
  }
}

export class ProductUpdatedEvent implements DomainEvent {
  readonly eventType = 'ProductUpdated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(public readonly productId: ProductId) {
    this.occurredAt = new Date();
    this.aggregateId = productId.value;
  }
}

export class ProductStockUpdatedEvent implements DomainEvent {
  readonly eventType = 'ProductStockUpdated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly productId: ProductId,
    public readonly minStock: Quantity,
    public readonly maxStock: Quantity | null
  ) {
    this.occurredAt = new Date();
    this.aggregateId = productId.value;
  }
}

export class ProductImageUpdatedEvent implements DomainEvent {
  readonly eventType = 'ProductImageUpdated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly productId: ProductId,
    public readonly imageUrl: string | null
  ) {
    this.occurredAt = new Date();
    this.aggregateId = productId.value;
  }
}

export class ProductActivatedEvent implements DomainEvent {
  readonly eventType = 'ProductActivated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(public readonly productId: ProductId) {
    this.occurredAt = new Date();
    this.aggregateId = productId.value;
  }
}

export class ProductDeactivatedEvent implements DomainEvent {
  readonly eventType = 'ProductDeactivated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(public readonly productId: ProductId) {
    this.occurredAt = new Date();
    this.aggregateId = productId.value;
  }
}