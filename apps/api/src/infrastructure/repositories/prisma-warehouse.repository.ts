import { inject, injectable } from 'inversify';
import { PrismaService } from '@aquasystem/infrastructure';
import { WarehouseRepositoryPort, WarehouseSearchCriteria } from '@aquasystem/domain';
import { Warehouse, WarehouseId } from '@aquasystem/domain';
import { PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';

@injectable()
export class PrismaWarehouseRepository implements WarehouseRepositoryPort {
  constructor(@inject('PrismaService') private readonly prisma: PrismaService) {}

  async findById(id: WarehouseId): Promise<Warehouse | null> {
    const record = await this.prisma.warehouse.findUnique({
      where: { id: id.value },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByCode(code: string): Promise<Warehouse | null> {
    const record = await this.prisma.warehouse.findUnique({
      where: { code: code.toUpperCase() },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(warehouse: Warehouse): Promise<void> {
    const data = this.toPersistence(warehouse);
    await this.prisma.warehouse.upsert({
      where: { id: warehouse.id.value },
      create: data,
      update: data,
    });
  }

  async delete(id: WarehouseId): Promise<void> {
    await this.prisma.warehouse.delete({
      where: { id: id.value },
    });
  }

  async findAll(params: PaginationParams, criteria?: WarehouseSearchCriteria): Promise<PaginatedResult<Warehouse>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (criteria?.isActive !== undefined) where.isActive = criteria.isActive;
    if (criteria?.search) {
      where.OR = [
        { name: { contains: criteria.search, mode: 'insensitive' } },
        { code: { contains: criteria.search, mode: 'insensitive' } },
        { address: { contains: criteria.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        skip,
        take: limit,
        orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.warehouse.count({ where }),
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

  private toDomain(record: any): Warehouse {
    return Warehouse.reconstitute({
      id: new WarehouseId(record.id),
      name: record.name,
      code: record.code,
      address: record.address,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toPersistence(warehouse: Warehouse): any {
    return {
      id: warehouse.id.value,
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address,
      isActive: warehouse.isActive,
      createdAt: warehouse.createdAt,
      updatedAt: warehouse.updatedAt,
    };
  }
}
