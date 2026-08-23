import { AggregateRoot } from './base';
import { CustomerId } from '../value-objects/ids';
import { Email } from '../value-objects/email';
import { PersonName } from '../value-objects/person-name';
import { Result, DomainError, ValidationError } from '@aquasystem/shared-kernel';
import { Money } from '../value-objects/money';

interface CustomerProps {
  id: CustomerId;
  code: string;
  name: string;
  email: Email | null;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  creditLimit: Money;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateCustomerData {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  creditLimit?: number;
}

export class Customer extends AggregateRoot<CustomerId> {
  private constructor(
    id: CustomerId,
    private readonly _code: string,
    private _name: string,
    private _email: Email | null,
    private _phone: string | null,
    private _address: string | null,
    private _taxId: string | null,
    private _creditLimit: Money,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  static create(data: CreateCustomerData): Result<Customer, DomainError> {
    if (!data.code || data.code.trim().length === 0) {
      return Result.fail(new ValidationError('Customer code is required'));
    }
    if (!data.name || data.name.trim().length === 0) {
      return Result.fail(new ValidationError('Customer name is required'));
    }

    let emailResult = Result.ok<Email | null>(null);
    if (data.email) {
      emailResult = Email.create(data.email);
      if (!emailResult.ok) return Result.fail(emailResult.error);
    }

    const creditLimitResult = Money.create(data.creditLimit || 0);
    if (!creditLimitResult.ok) return Result.fail(creditLimitResult.error);

    const customer = new Customer(
      CustomerId.generate(),
      data.code.trim().toUpperCase(),
      data.name.trim(),
      emailResult.value,
      data.phone?.trim() || null,
      data.address?.trim() || null,
      data.taxId?.trim() || null,
      creditLimitResult.value,
      true,
      new Date(),
      new Date()
    );

    customer.addDomainEvent(new CustomerCreatedEvent(customer.id, customer.code, customer.name));
    return Result.ok(customer);
  }

  static reconstitute(props: CustomerProps): Customer {
    return new Customer(
      props.id,
      props.code,
      props.name,
      props.email,
      props.phone,
      props.address,
      props.taxId,
      props.creditLimit,
      props.isActive,
      props.createdAt,
      props.updatedAt
    );
  }

  get code(): string {
    return this._code;
  }

  get name(): string {
    return this._name;
  }

  get email(): Email | null {
    return this._email;
  }

  get phone(): string | null {
    return this._phone;
  }

  get address(): string | null {
    return this._address;
  }

  get taxId(): string | null {
    return this._taxId;
  }

  get creditLimit(): Money {
    return this._creditLimit;
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

  updateDetails(data: Partial<CreateCustomerData>): Result<void, DomainError> {
    if (data.name) {
      if (data.name.trim().length === 0) {
        return Result.fail(new ValidationError('Customer name cannot be empty'));
      }
      this._name = data.name.trim();
    }
    if (data.email !== undefined) {
      if (data.email) {
        const emailResult = Email.create(data.email);
        if (!emailResult.ok) return Result.fail(emailResult.error);
        this._email = emailResult.value;
      } else {
        this._email = null;
      }
    }
    if (data.phone !== undefined) {
      this._phone = data.phone?.trim() || null;
    }
    if (data.address !== undefined) {
      this._address = data.address?.trim() || null;
    }
    if (data.taxId !== undefined) {
      this._taxId = data.taxId?.trim() || null;
    }
    if (data.creditLimit !== undefined) {
      const creditLimitResult = Money.create(data.creditLimit);
      if (!creditLimitResult.ok) return Result.fail(creditLimitResult.error);
      this._creditLimit = creditLimitResult.value;
    }
    this._updatedAt = new Date();
    this.addDomainEvent(new CustomerUpdatedEvent(this.id));
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

export class CustomerCreatedEvent implements DomainEvent {
  readonly eventType = 'CustomerCreated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly customerId: CustomerId,
    public readonly code: string,
    public readonly name: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = customerId.value;
  }
}

export class CustomerUpdatedEvent implements DomainEvent {
  readonly eventType = 'CustomerUpdated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(public readonly customerId: CustomerId) {
    this.occurredAt = new Date();
    this.aggregateId = customerId.value;
  }
}