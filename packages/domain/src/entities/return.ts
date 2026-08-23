import { AggregateRoot } from './base';
import { ReturnId, InvoiceId, CustomerId, UserId, ProductId } from '../value-objects/ids';
import { Money } from '../value-objects/money';
import { Quantity } from '../value-objects/quantity';
import { ReturnStatus, ReturnCondition } from '@aquasystem/shared-kernel';
import { Result, DomainError, BusinessRuleError } from '@aquasystem/shared-kernel';

interface ReturnItemProps {
  id: string;
  productId: ProductId;
  productName: string;
  quantity: Quantity;
  unitPrice: Money;
  reason: string;
  condition: ReturnCondition;
}

export class ReturnItem {
  constructor(
    public readonly id: string,
    public readonly productId: ProductId,
    public readonly productName: string,
    public readonly quantity: Quantity,
    public readonly unitPrice: Money,
    public readonly reason: string,
    public readonly condition: ReturnCondition
  ) {}

  static create(
    productId: ProductId,
    productName: string,
    quantity: Quantity,
    unitPrice: Money,
    reason: string,
    condition: ReturnCondition
  ): Result<ReturnItem, DomainError> {
    if (!reason || reason.trim().length === 0) {
      return Result.fail(new BusinessRuleError('Return reason is required'));
    }
    return Result.ok(
      new ReturnItem(
        crypto.randomUUID(),
        productId,
        productName,
        quantity,
        unitPrice,
        reason.trim(),
        condition
      )
    );
  }

  get total(): Money {
    return this.unitPrice.multiply(this.quantity._value).unwrap();
  }
}

interface ReturnProps {
  id: ReturnId;
  returnNumber: string;
  invoiceId: InvoiceId;
  customerId: CustomerId;
  userId: UserId;
  status: ReturnStatus;
  reason: string;
  items: ReturnItem[];
  total: Money;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateReturnData {
  invoiceId: InvoiceId;
  customerId: CustomerId;
  userId: UserId;
  reason: string;
  items: Array<{
    productId: ProductId;
    productName: string;
    quantity: Quantity;
    unitPrice: Money;
    reason: string;
    condition: ReturnCondition;
  }>;
}

export class Return extends AggregateRoot<ReturnId> {
  private constructor(
    id: ReturnId,
    private readonly _returnNumber: string,
    private readonly _invoiceId: InvoiceId,
    private readonly _customerId: CustomerId,
    private readonly _userId: UserId,
    private _status: ReturnStatus,
    private _reason: string,
    private _items: ReturnItem[],
    private _total: Money,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  static create(data: CreateReturnData): Result<Return, DomainError> {
    if (data.items.length === 0) {
      return Result.fail(new BusinessRuleError('Return must have at least one item'));
    }

    const items: ReturnItem[] = [];
    let total = Money.zero();

    for (const item of data.items) {
      const itemResult = ReturnItem.create(
        item.productId,
        item.productName,
        item.quantity,
        item.unitPrice,
        item.reason,
        item.condition
      );
      if (!itemResult.ok) return Result.fail(itemResult.error);
      items.push(itemResult.value);
      total = total.add(itemResult.value.total);
    }

    const returnNumber = `RET-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const returnEntity = new Return(
      ReturnId.generate(),
      returnNumber,
      data.invoiceId,
      data.customerId,
      data.userId,
      ReturnStatus.PENDING,
      data.reason.trim(),
      items,
      total,
      new Date(),
      new Date()
    );

    returnEntity.addDomainEvent(new ReturnCreatedEvent(returnEntity.id, returnEntity.returnNumber, returnEntity.invoiceId));
    return Result.ok(returnEntity);
  }

  static reconstitute(props: ReturnProps): Return {
    return new Return(
      props.id,
      props.returnNumber,
      props.invoiceId,
      props.customerId,
      props.userId,
      props.status,
      props.reason,
      props.items,
      props.total,
      props.createdAt,
      props.updatedAt
    );
  }

  get returnNumber(): string {
    return this._returnNumber;
  }

  get invoiceId(): InvoiceId {
    return this._invoiceId;
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  get userId(): UserId {
    return this._userId;
  }

  get status(): ReturnStatus {
    return this._status;
  }

  get reason(): string {
    return this._reason;
  }

  get items(): ReturnItem[] {
    return [...this._items];
  }

  get total(): Money {
    return this._total;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  approve(): Result<void, DomainError> {
    if (this._status !== ReturnStatus.PENDING) {
      return Result.fail(new BusinessRuleError('Only pending returns can be approved'));
    }
    this._status = ReturnStatus.APPROVED;
    this._updatedAt = new Date();
    this.addDomainEvent(new ReturnApprovedEvent(this.id, this.returnNumber));
    return Result.ok(undefined);
  }

  reject(reason: string): Result<void, DomainError> {
    if (this._status !== ReturnStatus.PENDING) {
      return Result.fail(new BusinessRuleError('Only pending returns can be rejected'));
    }
    this._status = ReturnStatus.REJECTED;
    this._updatedAt = new Date();
    this.addDomainEvent(new ReturnRejectedEvent(this.id, this.returnNumber, reason));
    return Result.ok(undefined);
  }

  process(): Result<void, DomainError> {
    if (this._status !== ReturnStatus.APPROVED) {
      return Result.fail(new BusinessRuleError('Only approved returns can be processed'));
    }
    this._status = ReturnStatus.PROCESSED;
    this._updatedAt = new Date();
    this.addDomainEvent(new ReturnProcessedEvent(this.id, this.returnNumber));
    return Result.ok(undefined);
  }

  refund(): Result<void, DomainError> {
    if (this._status !== ReturnStatus.PROCESSED) {
      return Result.fail(new BusinessRuleError('Only processed returns can be refunded'));
    }
    this._status = ReturnStatus.REFUNDED;
    this._updatedAt = new Date();
    this.addDomainEvent(new ReturnRefundedEvent(this.id, this.returnNumber, this.total));
    return Result.ok(undefined);
  }
}

export class ReturnCreatedEvent implements DomainEvent {
  readonly eventType = 'ReturnCreated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly returnId: ReturnId,
    public readonly returnNumber: string,
    public readonly invoiceId: InvoiceId
  ) {
    this.occurredAt = new Date();
    this.aggregateId = returnId.value;
  }
}

export class ReturnApprovedEvent implements DomainEvent {
  readonly eventType = 'ReturnApproved';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly returnId: ReturnId,
    public readonly returnNumber: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = returnId.value;
  }
}

export class ReturnRejectedEvent implements DomainEvent {
  readonly eventType = 'ReturnRejected';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly returnId: ReturnId,
    public readonly returnNumber: string,
    public readonly reason: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = returnId.value;
  }
}

export class ReturnProcessedEvent implements DomainEvent {
  readonly eventType = 'ReturnProcessed';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly returnId: ReturnId,
    public readonly returnNumber: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = returnId.value;
  }
}

export class ReturnRefundedEvent implements DomainEvent {
  readonly eventType = 'ReturnRefunded';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly returnId: ReturnId,
    public readonly returnNumber: string,
    public readonly amount: Money
  ) {
    this.occurredAt = new Date();
    this.aggregateId = returnId.value;
  }
}