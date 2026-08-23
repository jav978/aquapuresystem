import { AggregateRoot } from '../entities/base';
import { SaleId, CustomerId, UserId } from '../value-objects/ids';
import { Money } from '../value-objects/money';
import { Quantity } from '../value-objects/quantity';
import { Sale, SaleItem } from '../entities/sale';
import { Result, DomainError, BusinessRuleError } from '@aquasystem/shared-kernel';

interface SalesOrderProps {
  sale: Sale;
  customerCreditLimit: Money;
  customerUsedCredit: Money;
}

export class SalesOrder extends AggregateRoot<SaleId> {
  private constructor(
    private _sale: Sale,
    private _customerCreditLimit: Money,
    private _customerUsedCredit: Money
  ) {
    super(_sale.id);
  }

  static create(sale: Sale, creditLimit: Money, usedCredit: Money): SalesOrder {
    return new SalesOrder(sale, creditLimit, usedCredit);
  }

  get sale(): Sale {
    return this._sale;
  }

  get customerCreditLimit(): Money {
    return this._customerCreditLimit;
  }

  get customerUsedCredit(): Money {
    return this._customerUsedCredit;
  }

  get availableCredit(): Money {
    return this._customerCreditLimit.subtract(this._customerUsedCredit).unwrap();
  }

  validateCreditLimit(): Result<void, DomainError> {
    if (this._sale.total._value > this.availableCredit._value) {
      return Result.fail(
        new BusinessRuleError(
          `Sale total ${this._sale.total} exceeds available credit ${this.availableCredit}`
        )
      );
    }
    return Result.ok(undefined);
  }

  validateStockAvailability(
    checkStock: (productId: string) => Promise<Quantity>
  ): Promise<Result<void, DomainError>> {
    // This would be implemented in the application layer with a repository
    return Promise.resolve(Result.ok(undefined));
  }

  confirm(): Result<void, DomainError> {
    const creditResult = this.validateCreditLimit();
    if (!creditResult.ok) return creditResult;

    const confirmResult = this._sale.confirm();
    if (!confirmResult.ok) return confirmResult;

    this.addDomainEvent(new SalesOrderConfirmedEvent(this.id, this._sale.saleNumber));
    return Result.ok(undefined);
  }

  cancel(reason: string): Result<void, DomainError> {
    const cancelResult = this._sale.cancel(reason);
    if (!cancelResult.ok) return cancelResult;

    this.addDomainEvent(new SalesOrderCancelledEvent(this.id, this._sale.saleNumber, reason));
    return Result.ok(undefined);
  }
}

export class SalesOrderConfirmedEvent implements DomainEvent {
  readonly eventType = 'SalesOrderConfirmed';
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

export class SalesOrderCancelledEvent implements DomainEvent {
  readonly eventType = 'SalesOrderCancelled';
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

export type DomainEvent = {
  eventType: string;
  occurredAt: Date;
  aggregateId: string;
};