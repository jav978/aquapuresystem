import { PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';

export interface InventoryMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;
  reason: string | null;
  referenceId: string | null;
  referenceType: string | null;
  userId: string;
  createdAt: Date;
}

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  LOSS = 'LOSS',
}

export interface InventoryMovementRepositoryPort {
  findById(id: string): Promise<InventoryMovement | null>;
  save(movement: InventoryMovement): Promise<void>;
  findAll(params: PaginationParams, criteria?: InventoryMovementSearchCriteria): Promise<PaginatedResult<InventoryMovement>>;
  findByProduct(productId: string, params: PaginationParams): Promise<PaginatedResult<InventoryMovement>>;
  findByWarehouse(warehouseId: string, params: PaginationParams): Promise<PaginatedResult<InventoryMovement>>;
  findByReference(referenceId: string, referenceType: string): Promise<InventoryMovement[]>;
}

export interface InventoryMovementSearchCriteria {
  productId?: string;
  warehouseId?: string;
  type?: MovementType;
  referenceId?: string;
  referenceType?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}