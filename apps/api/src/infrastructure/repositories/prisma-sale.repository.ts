import { inject, injectable } from 'inversify';
import { PrismaService } from '@aquasystem/infrastructure';
import { SaleRepositoryPort, SaleSearchCriteria } from '@aquasystem/domain';
import { Sale, SaleId, CustomerId, UserId, ProductId, SaleItem, Money, Quantity } from '@aquasystem/domain';
import { PaginatedResult, PaginationParams, SaleStatus } from '@aquasystem/shared-kernel';

@injectable()
export class PrismaSaleRepository implements SaleRepositoryPort {
  constructor(@inject('PrismaService') private readonly prisma: PrismaService) {}

  async findById(id: SaleId): Promise<Sale | null> {
    const record = await this.prisma.sale.findUnique({
      where: { id: id.value },
      include: { items: { include: { product: true } } },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByNumber(saleNumber: string): Promise<Sale | null> {
    const record = await this.prisma.sale.findUnique({
      where: { saleNumber },
      include: { items: { include: { product: true } } },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(sale: Sale): Promise<void> {
    const data = this.toPersistence(sale);
    const { items, ...saleData } = data;

    await this.prisma.$transaction(async (tx) => {
      await tx.sale.upsert({
        where: { id: sale.id.value },
        create: saleData,
        update: saleData,
      });

      // Sync items
      await tx.saleItem.deleteMany({
        where: { saleId: sale.id.value },
      });

      if (items.length > 0) {
        await tx.saleItem.createMany({
          data: items.map((item: any) => ({
            ...item,
            saleId: sale.id.value,
          })),
        });
      }
    });
  }

  async delete(id: SaleId): Promise<void> {
    await this.prisma.sale.delete({
      where: { id: id.value },
    });
  }

  async findAll(params: PaginationParams, criteria?: SaleSearchCriteria): Promise<PaginatedResult<Sale>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (criteria?.customerId) where.customerId = criteria.customerId.value;
    if (criteria?.userId) where.userId = criteria.userId.value;
    if (criteria?.status) where.status = criteria.status;
    if (criteria?.dateFrom || criteria?.dateTo) {
      where.saleDate = {};
      if (criteria.dateFrom) where.saleDate.gte = criteria.dateFrom;
      if (criteria.dateTo) where.saleDate.lte = criteria.dateTo;
    }
    if (criteria?.search) {
      where.OR = [
        { saleNumber: { contains: criteria.search, mode: 'insensitive' } },
        { customer: { name: { contains: criteria.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip,
        take: limit,
        include: { items: { include: { product: true } } },
        orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.sale.count({ where }),
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

  async findByCustomer(customerId: CustomerId, params: PaginationParams): Promise<PaginatedResult<Sale>> {
    return this.findAll(params, { customerId });
  }

  async findByUser(userId: UserId, params: PaginationParams): Promise<PaginatedResult<Sale>> {
    return this.findAll(params, { userId });
  }

  async findByStatus(status: SaleStatus, params: PaginationParams): Promise<PaginatedResult<Sale>> {
    return this.findAll(params, { status });
  }

  private toDomain(record: any): Sale {
    const items = (record.items || []).map(
      (item: any) =>
        new SaleItem(
          item.id,
          new ProductId(item.productId),
          item.product?.name || 'Product',
          Quantity.create(item.quantity).unwrap(),
          Money.reconstitute(Number(item.unitPrice), 'USD'),
          Money.reconstitute(Number(item.discount || 0), 'USD'),
          Money.reconstitute(Number(item.total), 'USD')
        )
    );

    return Sale.reconstitute({
      id: new SaleId(record.id),
      saleNumber: record.saleNumber,
      customerId: new CustomerId(record.customerId),
      userId: new UserId(record.userId),
      status: record.status as SaleStatus,
      items,
      subtotal: Money.reconstitute(Number(record.subtotal), 'USD'),
      taxAmount: Money.reconstitute(Number(record.taxAmount), 'USD'),
      discount: Money.reconstitute(Number(record.discount || 0), 'USD'),
      total: Money.reconstitute(Number(record.total), 'USD'),
      notes: record.notes,
      saleDate: record.saleDate,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toPersistence(sale: Sale): any {
    return {
      id: sale.id.value,
      saleNumber: sale.saleNumber,
      customerId: sale.customerId.value,
      userId: sale.userId.value,
      status: sale.status,
      subtotal: sale.subtotal._value,
      taxAmount: sale.taxAmount._value,
      discount: sale.discount._value,
      total: sale.total._value,
      notes: sale.notes,
      saleDate: sale.saleDate,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
      items: sale.items.map((item) => ({
        id: item.id,
        productId: item.productId.value,
        quantity: item.quantity._value,
        unitPrice: item.unitPrice._value,
        discount: item.discount._value,
        total: item.total._value,
      })),
    };
  }
}
