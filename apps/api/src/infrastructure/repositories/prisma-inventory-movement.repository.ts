import { inject, injectable } from 'inversify';
import { PrismaService } from '@aquasystem/infrastructure';
import {
  InventoryMovementRepositoryPort,
  InventoryMovementSearchCriteria,
  InventoryMovement,
  MovementType,
} from '@aquasystem/domain';
import { PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';

@injectable()
export class PrismaInventoryMovementRepository implements InventoryMovementRepositoryPort {
  constructor(@inject('PrismaService') private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<InventoryMovement | null> {
    const record = await this.prisma.inventoryMovement.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(movement: InventoryMovement): Promise<void> {
    const data = {
      productId: movement.productId,
      warehouseId: movement.warehouseId,
      type: movement.type as any,
      quantity: movement.quantity,
      reason: movement.reason,
      referenceId: movement.referenceId,
      referenceType: movement.referenceType,
      userId: movement.userId,
    };

    if (movement.id) {
      await this.prisma.inventoryMovement.upsert({
        where: { id: movement.id },
        create: { id: movement.id, ...data },
        update: data,
      });
    } else {
      await this.prisma.inventoryMovement.create({
        data,
      });
    }
  }

  async findAll(
    params: PaginationParams,
    criteria?: InventoryMovementSearchCriteria
  ): Promise<PaginatedResult<InventoryMovement>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (criteria?.productId) where.productId = criteria.productId;
    if (criteria?.warehouseId) where.warehouseId = criteria.warehouseId;
    if (criteria?.type) where.type = criteria.type;
    if (criteria?.referenceId) where.referenceId = criteria.referenceId;
    if (criteria?.referenceType) where.referenceType = criteria.referenceType;
    if (criteria?.userId) where.userId = criteria.userId;
    if (criteria?.dateFrom || criteria?.dateTo) {
      where.createdAt = {};
      if (criteria.dateFrom) where.createdAt.gte = criteria.dateFrom;
      if (criteria.dateTo) where.createdAt.lte = criteria.dateTo;
    }

    const [data, total] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);

    return {
      data: data.map(this.toDomain),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findByProduct(productId: string, params: PaginationParams): Promise<PaginatedResult<InventoryMovement>> {
    return this.findAll(params, { productId });
  }

  async findByWarehouse(warehouseId: string, params: PaginationParams): Promise<PaginatedResult<InventoryMovement>> {
    return this.findAll(params, { warehouseId });
  }

  async findByReference(referenceId: string, referenceType: string): Promise<InventoryMovement[]> {
    const records = await this.prisma.inventoryMovement.findMany({
      where: { referenceId, referenceType },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(this.toDomain);
  }

  private toDomain(record: any): InventoryMovement {
    return {
      id: record.id,
      productId: record.productId,
      warehouseId: record.warehouseId,
      type: record.type as MovementType,
      quantity: record.quantity,
      reason: record.reason,
      referenceId: record.referenceId,
      referenceType: record.referenceType,
      userId: record.userId,
      createdAt: record.createdAt,
    };
  }
}
