import { Result, DomainError } from '@aquasystem/shared-kernel';

export abstract class Entity<T extends EntityId> {
  protected _domainEvents: DomainEvent[] = [];

  constructor(protected readonly _id: T) {}

  get id(): T {
    return this._id;
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  pullDomainEvents(): DomainEvent[] {
    const events = this._domainEvents;
    this._domainEvents = [];
    return events;
  }

  equals(other: Entity<T>): boolean {
    if (other === null || other === undefined) return false;
    if (!(other instanceof this.constructor)) return false;
    return this._id.equals(other._id);
  }
}

export abstract class EntityId {
  abstract equals(other: EntityId): boolean;
}

export interface DomainEvent {
  eventType: string;
  occurredAt: Date;
  aggregateId: string;
}

export abstract class AggregateRoot<T extends EntityId> extends Entity<T> {
  protected constructor(id: T) {
    super(id);
  }
}