import { AggregateRoot } from './base';
import { InvoiceId, SaleId, CustomerId, UserId, ProductId } from '../value-objects/ids';
import { Money } from '../value-objects/money';
import { Quantity } from '../value-objects/quantity';
import { InvoiceStatus, PaymentStatus } from '@aquasystem/shared-kernel';
import { Result, DomainError, BusinessRuleError } from '@aquasystem/shared-kernel';

interface InvoiceItemProps {
  id: string;
  productId: ProductId;
  productName: string;
  quantity: Quantity;
  unitPrice: Money;
  discount: Money;
  taxRate: number;
  total: Money;
}

export class InvoiceItem {
  constructor(
    public readonly id: string,
    public readonly productId: ProductId,
    public readonly productName: string,
    public readonly quantity: Quantity,
    public readonly unitPrice: Money,
    public readonly discount: Money,
    public readonly taxRate: number,
    public readonly total: Money
  ) {}

  static create(
    productId: ProductId,
    productName: string,
    quantity: Quantity,
    unitPrice: Money,
    discount: Money = Money.zero(),
    taxRate: number = 21
  ): Result<InvoiceItem, DomainError> {
    const baseTotalResult = unitPrice.multiply(quantity._value);
    if (!baseTotalResult.ok) return Result.fail(baseTotalResult.error);

    const afterDiscountResult = baseTotalResult.value.subtract(discount);
    if (!afterDiscountResult.ok) return Result.fail(afterDiscountResult.error);

    const taxAmountResult = afterDiscountResult.value.percentage(taxRate);
    if (!taxAmountResult.ok) return Result.fail(taxAmountResult.error);

    const totalResult = afterDiscountResult.value.add(taxAmountResult.value);
    if (!totalResult.ok) return Result.fail(totalResult.error);

    return Result.ok(
      new InvoiceItem(
        crypto.randomUUID(),
        productId,
        productName,
        quantity,
        unitPrice,
        discount,
        taxRate,
        totalResult.value
      )
    );
  }
}

interface PaymentProps {
  id: string;
  paymentNumber: string;
  amount: Money;
  method: string;
  reference: string | null;
  status: PaymentStatus;
  paidAt: Date | null;
  createdAt: Date;
}

export class Payment {
  constructor(
    public readonly id: string,
    public readonly paymentNumber: string,
    public readonly amount: Money,
    public readonly method: string,
    public readonly reference: string | null,
    public readonly status: PaymentStatus,
    public readonly paidAt: Date | null,
    public readonly createdAt: Date
  ) {}

  static create(
    amount: Money,
    method: string,
    reference: string | null = null
  ): Payment {
    return new Payment(
      crypto.randomUUID(),
      `PAY-${Date.now().toString(36).toUpperCase()}`,
      amount,
      method,
      reference,
      PaymentStatus.PENDING,
      null,
      new Date()
    );
  }

  markCompleted(): Payment {
    return new Payment(
      this.id,
      this.paymentNumber,
      this.amount,
      this.method,
      this.reference,
      PaymentStatus.COMPLETED,
      new Date(),
      this.createdAt
    );
  }

  markFailed(): Payment {
    return new Payment(
      this.id,
      this.paymentNumber,
      this.amount,
      this.method,
      this.reference,
      PaymentStatus.FAILED,
      null,
      this.createdAt
    );
  }
}

interface InvoiceProps {
  id: InvoiceId;
  invoiceNumber: string;
  saleId: SaleId | null;
  customerId: CustomerId;
  userId: UserId;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: Money;
  taxAmount: Money;
  total: Money;
  payments: Payment[];
  issueDate: Date;
  dueDate: Date | null;
  paidDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateInvoiceData {
  saleId?: SaleId;
  customerId: CustomerId;
  userId: UserId;
  items: Array<{
    productId: ProductId;
    productName: string;
    quantity: Quantity;
    unitPrice: Money;
    discount?: Money;
    taxRate?: number;
  }>;
  dueDate?: Date;
  notes?: string;
}

export class Invoice extends AggregateRoot<InvoiceId> {
  private constructor(
    id: InvoiceId,
    private readonly _invoiceNumber: string,
    private readonly _saleId: SaleId | null,
    private readonly _customerId: CustomerId,
    private readonly _userId: UserId,
    private _status: InvoiceStatus,
    private _items: InvoiceItem[],
    private _subtotal: Money,
    private _taxAmount: Money,
    private _total: Money,
    private _payments: Payment[],
    private readonly _issueDate: Date,
    private _dueDate: Date | null,
    private _paidDate: Date | null,
    private _notes: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  static create(data: CreateInvoiceData): Result<Invoice, DomainError> {
    if (data.items.length === 0) {
      return Result.fail(new BusinessRuleError('Invoice must have at least one item'));
    }

    const items: InvoiceItem[] = [];
    let subtotal = Money.zero();
    let taxAmount = Money.zero();

    for (const item of data.items) {
      const itemResult = InvoiceItem.create(
        item.productId,
        item.productName,
        item.quantity,
        item.unitPrice,
        item.discount,
        item.taxRate
      );
      if (!itemResult.ok) return Result.fail(itemResult.error);
      items.push(itemResult.value);
      subtotal = subtotal.add(itemResult.value.total);
      taxAmount = taxAmount.add(
        itemResult.value.total.subtract(
          itemResult.value.unitPrice.multiply(itemResult.value.quantity._value).unwrap()
        ).unwrap()
      );
    }

    const totalResult = subtotal.add(taxAmount);
    if (!totalResult.ok) return Result.fail(totalResult.error);

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const invoice = new Invoice(
      InvoiceId.generate(),
      invoiceNumber,
      data.saleId || null,
      data.customerId,
      data.userId,
      InvoiceStatus.DRAFT,
      items,
      subtotal,
      taxAmount,
      totalResult.value,
      [],
      new Date(),
      data.dueDate || null,
      null,
      data.notes || null,
      new Date(),
      new Date()
    );

    invoice.addDomainEvent(new InvoiceCreatedEvent(invoice.id, invoice.invoiceNumber, invoice.customerId));
    return Result.ok(invoice);
  }

  static reconstitute(props: InvoiceProps): Invoice {
    return new Invoice(
      props.id,
      props.invoiceNumber,
      props.saleId,
      props.customerId,
      props.userId,
      props.status,
      props.items,
      props.subtotal,
      props.taxAmount,
      props.total,
      props.payments,
      props.issueDate,
      props.dueDate,
      props.paidDate,
      props.notes,
      props.createdAt,
      props.updatedAt
    );
  }

  get invoiceNumber(): string {
    return this._invoiceNumber;
  }

  get saleId(): SaleId | null {
    return this._saleId;
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  get userId(): UserId {
    return this._userId;
  }

  get status(): InvoiceStatus {
    return this._status;
  }

  get items(): InvoiceItem[] {
    return [...this._items];
  }

  get subtotal(): Money {
    return this._subtotal;
  }

  get taxAmount(): Money {
    return this._taxAmount;
  }

  get total(): Money {
    return this._total;
  }

  get payments(): Payment[] {
    return [...this._payments];
  }

  get issueDate(): Date {
    return this._issueDate;
  }

  get dueDate(): Date | null {
    return this._dueDate;
  }

  get paidDate(): Date | null {
    return this._paidDate;
  }

  get notes(): string | null {
    return this._notes;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get paidAmount(): Money {
    return this._payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum.add(p.amount), Money.zero());
  }

  get pendingAmount(): Money {
    return this._total.subtract(this.paidAmount).unwrap();
  }

  get isFullyPaid(): boolean {
    return this.pendingAmount._value <= 0.01;
  }

  get isOverdue(): boolean {
    if (!this._dueDate) return false;
    return this._dueDate < new Date() && !this.isFullyPaid;
  }

  send(): Result<void, DomainError> {
    if (this._status !== InvoiceStatus.DRAFT) {
      return Result.fail(new BusinessRuleError('Only draft invoices can be sent'));
    }
    this._status = InvoiceStatus.SENT;
    this._updatedAt = new Date();
    this.addDomainEvent(new InvoiceSentEvent(this.id, this.invoiceNumber));
    return Result.ok(undefined);
  }

  addPayment(payment: Payment): Result<void, DomainError> {
    if (this._status === InvoiceStatus.CANCELLED || this._status === InvoiceStatus.REFUNDED) {
      return Result.fail(new BusinessRuleError('Cannot add payment to cancelled/refunded invoice'));
    }

    this._payments.push(payment);
    this.updateStatusFromPayments();
    this._updatedAt = new Date();
    this.addDomainEvent(new PaymentAddedEvent(this.id, payment.id, payment.amount));
    return Result.ok(undefined);
  }

  private updateStatusFromPayments(): void {
    const paidAmount = this.paidAmount;
    if (paidAmount._value <= 0.01) {
      this._status = this._status === InvoiceStatus.DRAFT ? InvoiceStatus.DRAFT : InvoiceStatus.SENT;
    } else if (paidAmount._value >= this._total._value - 0.01) {
      this._status = InvoiceStatus.PAID;
      if (!this._paidDate) this._paidDate = new Date();
    } else {
      this._status = InvoiceStatus.PARTIAL;
    }
  }

  markAsPaid(): Result<void, DomainError> {
    if (this._status === InvoiceStatus.PAID) {
      return Result.fail(new BusinessRuleError('Invoice already paid'));
    }
    this._status = InvoiceStatus.PAID;
    this._paidDate = new Date();
    this._updatedAt = new Date();
    this.addDomainEvent(new InvoicePaidEvent(this.id, this.invoiceNumber));
    return Result.ok(undefined);
  }

  cancel(reason: string): Result<void, DomainError> {
    if (this._status === InvoiceStatus.PAID || this._status === InvoiceStatus.REFUNDED) {
      return Result.fail(new BusinessRuleError('Cannot cancel paid or refunded invoice'));
    }
    this._status = InvoiceStatus.CANCELLED;
    this._updatedAt = new Date();
    this.addDomainEvent(new InvoiceCancelledEvent(this.id, this.invoiceNumber, reason));
    return Result.ok(undefined);
  }

  updateDueDate(dueDate: Date): void {
    this._dueDate = dueDate;
    this._updatedAt = new Date();
  }
}

export class InvoiceCreatedEvent implements DomainEvent {
  readonly eventType = 'InvoiceCreated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly invoiceId: InvoiceId,
    public readonly invoiceNumber: string,
    public readonly customerId: CustomerId
  ) {
    this.occurredAt = new Date();
    this.aggregateId = invoiceId.value;
  }
}

export class InvoiceSentEvent implements DomainEvent {
  readonly eventType = 'InvoiceSent';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly invoiceId: InvoiceId,
    public readonly invoiceNumber: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = invoiceId.value;
  }
}

export class InvoicePaidEvent implements DomainEvent {
  readonly eventType = 'InvoicePaid';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly invoiceId: InvoiceId,
    public readonly invoiceNumber: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = invoiceId.value;
  }
}

export class InvoiceCancelledEvent implements DomainEvent {
  readonly eventType = 'InvoiceCancelled';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly invoiceId: InvoiceId,
    public readonly invoiceNumber: string,
    public readonly reason: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = invoiceId.value;
  }
}

export class PaymentAddedEvent implements DomainEvent {
  readonly eventType = 'PaymentAdded';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly invoiceId: InvoiceId,
    public readonly paymentId: string,
    public readonly amount: Money
  ) {
    this.occurredAt = new Date();
    this.aggregateId = invoiceId.value;
  }
}