export * from '../entities/user';
export * from '../entities/product';
export * from '../entities/customer';
export * from '../entities/warehouse';
export * from '../entities/sale';
export * from '../entities/invoice';
export * from '../entities/return';
export * from '../aggregates/inventory';
export * from '../aggregates/sales-order';

export interface DomainEvent {
  eventType: string;
  occurredAt: Date;
  aggregateId: string;
}