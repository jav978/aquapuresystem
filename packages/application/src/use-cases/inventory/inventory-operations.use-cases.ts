import { inject, injectable } from 'inversify';
import { Result, PaginatedResult } from '@aquasystem/shared-kernel';
import { ProductRepositoryPort, WarehouseRepositoryPort, InventoryMovementRepositoryPort } from '@aquasystem/domain';
import { AdjustInventoryCommand, TransferInventoryCommand, InventoryMovementQuery, InventoryMovementDto, LowStockAlertDto } from '../../dto/inventory.dto';
import { UseCase } from '../../ports/inbound/use-case.port';
import { TYPES } from '../../types';
import { ProductId, WarehouseId } from '@aquasystem/domain';
import { Quantity } from '@aquasystem/domain';
import { MovementType } from '@aquasystem/shared-kernel';
import { EventBusPort } from '../../ports/outbound';
import { StockAdjustedEvent } from '@aquasystem/domain';

@injectable()
export class AdjustInventoryUseCase implements UseCase<AdjustInventoryCommand, void> {
  @inject(TYPES.ProductRepositoryPort) private readonly productRepo!: ProductRepositoryPort;
  @inject(TYPES.WarehouseRepositoryPort) private readonly warehouseRepo!: WarehouseRepositoryPort;
  @inject(TYPES.InventoryMovementRepositoryPort) private readonly movementRepo!: InventoryMovementRepositoryPort;
  @inject(TYPES.EventBusPort) private readonly eventBus!: EventBusPort;

  async execute(command: AdjustInventoryCommand): Promise<Result<void>> {
    const productId = ProductId.create(command.productId);
    const warehouseId = WarehouseId.create(command.warehouseId);

    const product = await this.productRepo.findById(productId);
    if (!product) {
      return Result.fail(new Error('Product not found'));
    }

    const warehouse = await this.warehouseRepo.findById(warehouseId);
    if (!warehouse) {
      return Result.fail(new Error('Warehouse not found'));
    }

    const quantity = Quantity.create(command.quantity).unwrap();

    // Record movement
    const movement: any = {
      id: crypto.randomUUID(),
      productId: productId.value,
      warehouseId: warehouseId.value,
      type: command.type,
      quantity: quantity._value,
      reason: command.reason,
      referenceId: null,
      referenceType: null,
      userId: 'system', // Would come from context
      createdAt: new Date(),
    };

    await this.movementRepo.save(movement);
    await this.eventBus.publish(new StockAdjustedEvent(warehouseId, productId, quantity, command.type === MovementType.IN ? 'IN' : 'OUT'));

    return Result.ok(undefined);
  }
}

@injectable()
export class TransferInventoryUseCase implements UseCase<TransferInventoryCommand, void> {
  @inject(TYPES.ProductRepositoryPort) private readonly productRepo!: ProductRepositoryPort;
  @inject(TYPES.WarehouseRepositoryPort) private readonly warehouseRepo!: WarehouseRepositoryPort;
  @inject(TYPES.InventoryMovementRepositoryPort) private readonly movementRepo!: InventoryMovementRepositoryPort;
  @inject(TYPES.EventBusPort) private readonly eventBus!: EventBusPort;

  async execute(command: TransferInventoryCommand): Promise<Result<void>> {
    const productId = ProductId.create(command.productId);
    const fromWarehouseId = WarehouseId.create(command.fromWarehouseId);
    const toWarehouseId = WarehouseId.create(command.toWarehouseId);

    const product = await this.productRepo.findById(productId);
    if (!product) {
      return Result.fail(new Error('Product not found'));
    }

    const fromWarehouse = await this.warehouseRepo.findById(fromWarehouseId);
    if (!fromWarehouse) {
      return Result.fail(new Error('Source warehouse not found'));
    }

    const toWarehouse = await this.warehouseRepo.findById(toWarehouseId);
    if (!toWarehouse) {
      return Result.fail(new Error('Destination warehouse not found'));
    }

    const quantity = Quantity.create(command.quantity).unwrap();

    // Out from source
    const outMovement: any = {
      id: crypto.randomUUID(),
      productId: productId.value,
      warehouseId: fromWarehouseId.value,
      type: MovementType.TRANSFER_OUT,
      quantity: quantity._value,
      reason: command.reason,
      referenceId: null,
      referenceType: 'TRANSFER',
      userId: 'system',
      createdAt: new Date(),
    };

    // In to destination
    const inMovement: any = {
      id: crypto.randomUUID(),
      productId: productId.value,
      warehouseId: toWarehouseId.value,
      type: MovementType.TRANSFER_IN,
      quantity: quantity._value,
      reason: command.reason,
      referenceId: outMovement.id,
      referenceType: 'TRANSFER',
      userId: 'system',
      createdAt: new Date(),
    };

    await this.movementRepo.save(outMovement);
    await this.movementRepo.save(inMovement);
    await this.eventBus.publish(new StockAdjustedEvent(fromWarehouseId, productId, quantity, 'OUT'));
    await this.eventBus.publish(new StockAdjustedEvent(toWarehouseId, productId, quantity, 'IN'));

    return Result.ok(undefined);
  }
}

@injectable()
export class GetInventoryMovementsUseCase implements UseCase<InventoryMovementQuery, PaginatedResult<InventoryMovementDto>> {
  @inject(TYPES.InventoryMovementRepositoryPort) private readonly movementRepo!: InventoryMovementRepositoryPort;

  async execute(query: InventoryMovementQuery): Promise<Result<PaginatedResult<InventoryMovementDto>>> {
    // In production, implement proper search with joins for product/warehouse names
    const result = await this.movementRepo.findAll(query, {
      productId: query.productId,
      warehouseId: query.warehouseId,
      type: query.type,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });

    return Result.ok({
      data: result.data.map((m: any) => ({
        ...m,
        productName: 'Product Name', // Would come from join
        warehouseName: 'Warehouse Name',
        userName: 'User Name',
      })),
      meta: result.meta,
    });
  }
}

@injectable()
export class GetLowStockAlertsUseCase implements UseCase<void, LowStockAlertDto[]> {
  @inject(TYPES.ProductRepositoryPort) private readonly productRepo!: ProductRepositoryPort;

  async execute(): Promise<Result<LowStockAlertDto[]>> {
    const lowStockProducts = await this.productRepo.findLowStock();
    
    // In production, check against inventory for each warehouse
    const alerts: LowStockAlertDto[] = lowStockProducts.map((product: any) => ({
      productId: product.id.value,
      productName: product.name,
      productSku: product.sku.value,
      warehouseId: 'default',
      warehouseName: 'Main Warehouse',
      currentStock: 0, // Would come from inventory
      minStock: product.minStock._value,
      severity: 0 <= product.minStock._value * 0.5 ? 'critical' : 'low',
    }));

    return Result.ok(alerts);
  }
}