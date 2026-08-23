import { AggregateRoot } from './base';
import { SaleId, ProductId, CustomerId, UserId } from '../value-objects/ids';
import { Money } from '../value-objects/money';
import { Quantity } from '../value-objects/quantity';
import { SaleStatus } from '@aquasystem/shared-kernel';
import { Result, DomainError, BusinessRuleError } from '@aquasystem/shared-kernel';

interface SaleItemProps {
  id: string;
  productId: ProductId;
  productName: string;
  quantity: Quantity;
  unitPrice: Money;
  discount: Money;
  total: Money;
}

export class SaleItem {
  constructor(
    public readonly id: string,
    public readonly productId: ProductId,
    public readonly productName: string,
    public readonly quantity: Quantity,
    public readonly unitPrice: Money,
    public readonly discount: Money,
    public readonly total: Money
  ) {}

  static create(
    productId: ProductId,
    productName: string,
    quantity: Quantity,
    unitPrice: Money,
    discount: Money = Money.zero()
  ): Result<SaleItem, DomainError> {
    const totalResult = unitPrice.multiply(quantity._value);
    if (!totalResult.ok) return Result.fail(totalResult.error);

    const finalTotalResult = totalResult.value.subtract(discount);
    if (!finalTotalResult.ok) return Result.fail(finalTotalResult.error);

    return Result.ok(
      new SaleItem(
        crypto.randomUUID(),
        productId,
        productName,
        quantity,
        unitPrice,
        discount,
        finalTotalResult.value
      )
    );
  }
}

interface SaleProps {
  id: SaleId;
  saleNumber: string;
  customerId: CustomerId;
  userId: UserId;
  status: SaleStatus;
  items: SaleItem[];
  subtotal: Money;
  taxAmount: Money;
  discount: Money;
  total: Money;
  notes: string | null;
  saleDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateSaleData {
  customerId: CustomerId;
  userId: UserId;
  items: Array<{
    productId: ProductId;
    productName: string;
    quantity: Quantity;
    unitPrice: Money;
    discount?: Money;
  }>;
  taxRate?: number;
  discount?: Money;
  notes?: string;
}

export class Sale extends AggregateRoot<SaleId> {
  private constructor(
    id: SaleId,
    private readonly _saleNumber: string,
    private readonly _customerId: CustomerId,
    private readonly _userId: UserId,
    private _status: SaleStatus,
    private _items: SaleItem[],
    private _subtotal: Money,
    private _taxAmount: Money,
    private _discount: Money,
    private _total: Money,
    private _notes: string | null,
    private readonly _saleDate: Date,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  static create(data: CreateSaleData): Result<Sale, DomainError> {
    if (data.items.length === 0) {
      return Result.fail(new BusinessRuleError('Sale must have at least one item'));
    }

    const items: SaleItem[] = [];
    let subtotal = Money.zero();

    for (const item of data.items) {
      const itemResult = SaleItem.create(
        item.productId,
        item.productName,
        item.quantity,
        item.unitPrice,
        item.discount
      );
      if (!itemResult.ok) return Result.fail(itemResult.error);
      items.push(itemResult.value);
      subtotal = subtotal.add(itemResult.value.total);
    }

    const discount = data.discount || Money.zero();
    const subtotalAfterDiscount = subtotal.subtract(discount).unwrap();

    const taxRate = data.taxRate || 21;
    const taxAmountResult = subtotalAfterDiscount.percentage(taxRate);
    if (!taxAmountResult.ok) return Result.fail(taxAmountResult.error);

    const totalResult = subtotalAfterDiscount.add(taxAmountResult.value);
    if (!totalResult.ok) return Result.fail(totalResult.error);

    const saleNumber = `SALE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const sale = new Sale(
      SaleId.generate(),
      saleNumber,
      data.customerId,
      data.userId,
      SaleStatus.PENDING,
      items,
      subtotal,
      taxAmountResult.value,
      discount,
      totalResult.value,
      data.notes || null,
      new Date(),
      new Date(),
      new Date()
    );

    sale.addDomainEvent(new SaleCreatedEvent(sale.id, sale.saleNumber, sale.customerId));
    return Result.ok(sale);
  }

  static reconstitute(props: SaleProps): Sale {
    return new Sale(
      props.id,
      props.saleNumber,
      props.customerId,
      props.userId,
      props.status,
      props.items,
      props.subtotal,
      props.taxAmount,
      props.discount,
      props.total,
      props.notes,
      props.saleDate,
      props.createdAt,
      props.updatedAt
    );
  }

  get saleNumber(): string {
    return this._saleNumber;
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  get userId(): UserId {
    return this._userId;
  }

  get status(): SaleStatus {
    return this._status;
  }

  get items(): SaleItem[] {
    return [...this._items];
  }

  get subtotal(): Money {
    return this._subtotal;
  }

  get taxAmount(): Money {
    return this._taxAmount;
  }

  get discount(): Money {
    return this._discount;
  }

  get total(): Money {
    return this._total;
  }

  get notes(): string | null {
    return this._notes;
  }

  get saleDate(): Date {
    return this._saleDate;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  confirm(): Result<void, DomainError> {
    if (this._status !== SaleStatus.PENDING) {
      return Result.fail(new BusinessRuleError('Only pending sales can be confirmed'));
    }
    this._status = SaleStatus.CONFIRMED;
    this._updatedAt = new Date();
    this.addDomainEvent(new SaleConfirmedEvent(this.id, this.saleNumber));
    return Result.ok(undefined);
  }

  ship(): Result<void, DomainError> {
    if (this._status !== SaleStatus.CONFIRMED) {
      return Result.fail(new BusinessRuleError('Only confirmed sales can be shipped'));
    }
    this._status = SaleStatus.SHIPPED;
    this._updatedAt = new Date();
    this.addDomainEvent(new SaleShippedEvent(this.id, this.saleNumber));
    return Result.ok(undefined);
  }

  deliver(): Result<void, DomainError> {
    if (this._status !== SaleStatus.SHIPPED) {
      return Result.fail(new BusinessRuleError('Only shipped sales can be delivered'));
    }
    this._status = SaleStatus.DELIVERED;
    this._updatedAt = new Date();
    this.addDomainEvent(new SaleDeliveredEvent(this.id, this.saleNumber));
    return Result.ok(undefined);
  }

  cancel(reason: string): Result<void, DomainError> {
    if ([SaleStatus.DELIVERED, SaleStatus.CANCELLED].includes(this._status)) {
      return Result.fail(new BusinessRuleError('Cannot cancel delivered or already cancelled sale'));
    }
    this._status = SaleStatus.CANCELLED;
    this._updatedAt = new Date();
    this.addDomainEvent(new SaleCancelledEvent(this.id, this.saleNumber, reason));
    return Result.ok(undefined);
  }

  addItem(
    productId: ProductId,
    productName: string,
    quantity: Quantity,
    unitPrice: Money,
    discount?: Money
  ): Result<void, DomainError> {
    if (this._status !== SaleStatus.PENDING) {
      return Result.fail(new BusinessRuleError('Cannot modify non-pending sale'));
    }

    const itemResult = SaleItem.create(productId, productName, quantity, unitPrice, discount);
    if (!itemResult.ok) return Result.fail(itemResult.error);

    this._items.push(itemResult.value);
    this.recalculateTotals();
    return Result.ok(undefined);
  }

  removeItem(itemId: string): Result<void, DomainError> {
    if (this._status !== SaleStatus.PENDING) {
      return Result.fail(new BusinessRuleError('Cannot modify non-pending sale'));
    }

    const index = this._items.findIndex((i) => i.id === itemId);
    if (index === -1) {
      return Result.fail(new BusinessRuleError('Item not found'));
    }

    this._items.splice(index, 1);
    this.recalculateTotals();
    return Result.ok(undefined);
  }

  private recalculateTotals(): void {
    this._subtotal = this._items.reduce((sum, item) => sum.add(item.total), Money.zero());
    const subtotalAfterDiscount = this._subtotal.subtract(this._discount).unwrap();
    const taxAmountResult = subtotalAfterDiscount.percentage(21);
    if (taxAmountResult.ok) {
      this._taxAmount = taxAmountResult.value;
      this._total = subtotalAfterDiscount.add(this._taxAmount).unwrap();
    }
    this._updatedAt = new Date();
  }
}

export class SaleCreatedEvent implements DomainEvent {
  readonly eventType = 'SaleCreated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly saleId: SaleId,
    public readonly saleNumber: string,
    public readonly customerId: CustomerId
  ) {
    this.occurredAt = new Date();
    this.aggregateId = saleId.value;
  }
}

export class SaleConfirmedEvent implements DomainEvent {
  readonly eventType = 'SaleConfirmed';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly saleId: SaleId,
    public readonly saleNumber: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = saleId.value;
  }
}

export class SaleShippedEvent implements DomainEvent {
  readonly eventType = 'SaleShipped';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly saleId: SaleId,
    public readonly saleNumber: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = saleId.value;
  }
}

export class SaleDeliveredEvent implements DomainEvent {
  readonly eventType = 'SaleDelivered';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly saleId: SaleId,
    public readonly saleNumber: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = saleId.value;
  }
}

export class SaleCancelledEvent implements DomainEvent {
  readonly eventType = 'SaleCancelled';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly saleId: SaleId,
    public readonly saleNumber: string,
    public readonly reason: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = saleId.value;
  }
}