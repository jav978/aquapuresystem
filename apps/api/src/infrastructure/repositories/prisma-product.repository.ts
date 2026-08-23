import { inject, injectable } from 'inversify';
import { PrismaService } from '@aquasystem/infrastructure';
import { ProductRepositoryPort } from '@aquasystem/domain';
import { Product, ProductId, SKU } from '@aquasystem/domain';
import { PaginatedResult, PaginationParams, ProductSearchCriteria } from '@aquasystem/shared-kernel';
import { ProductCategory, UnitOfMeasure } from '@aquasystem/shared-kernel';

@injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(@inject('PrismaService') private readonly prisma: PrismaService) {}

  async findById(id: ProductId): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({
      where: { id: id.value },
    });
    return record ? this.toDomain(record) : null;
  }

  async findBySku(sku: SKU): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({
      where: { sku: sku.value },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(product: Product): Promise<void> {
    const data = this.toPersistence(product);
    await this.prisma.product.upsert({
      where: { id: product.id.value },
      create: data,
      update: data,
    });
  }

  async delete(id: ProductId): Promise<void> {
    await this.prisma.product.delete({
      where: { id: id.value },
    });
  }

  async findAll(params: PaginationParams, criteria?: ProductSearchCriteria): Promise<PaginatedResult<Product>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (criteria?.category) where.category = criteria.category;
    if (criteria?.isActive !== undefined) where.isActive = criteria.isActive;
    if (criteria?.search) {
      where.OR = [
        { name: { contains: criteria.search, mode: 'insensitive' } },
        { sku: { contains: criteria.search, mode: 'insensitive' } },
        { description: { contains: criteria.search, mode: 'insensitive' } },
      ];
    }
    if (criteria?.lowStock) {
      where.minStock = { gt: 0 };
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
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

  async findLowStock(minStockThreshold?: number): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        minStock: { gt: 0 },
      },
    });

    // In production, would join with inventory to check actual stock
    return products.map(this.toDomain);
  }

  async findByCategory(category: string): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { category: category as ProductCategory, isActive: true },
    });
    return products.map(this.toDomain);
  }

  private toDomain(record: any): Product {
    return Product.reconstitute({
      id: new ProductId(record.id),
      sku: new SKU(record.sku),
      name: record.name,
      description: record.description,
      category: record.category,
      unit: record.unit,
      price: record.price,
      cost: record.cost,
      minStock: record.minStock,
      maxStock: record.maxStock,
      isActive: record.isActive,
      imageUrl: record.imageUrl,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toPersistence(product: Product): any {
    return {
      id: product.id.value,
      sku: product.sku.value,
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      price: product.price._value,
      cost: product.cost._value,
      minStock: product.minStock._value,
      maxStock: product.maxStock?._value ?? null,
      isActive: product.isActive,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}