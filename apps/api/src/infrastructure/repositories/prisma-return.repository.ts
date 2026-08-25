import { inject, injectable } from 'inversify';
import { PrismaService } from '@aquasystem/infrastructure';
import { ReturnRepositoryPort, ReturnSearchCriteria } from '@aquasystem/domain';
import { Return, ReturnId, InvoiceId, CustomerId, UserId, ProductId, ReturnItem, Money, Quantity } from '@aquasystem/domain';
import { PaginatedResult, PaginationParams, ReturnStatus, ReturnCondition } from '@aquasystem/shared-kernel';

@injectable()
export class PrismaReturnRepository implements ReturnRepositoryPort {
  constructor(@inject('PrismaService') private readonly prisma: PrismaService) {}

  async findById(id: ReturnId): Promise<Return | null> {
    const record = await this.prisma.return.findUnique({
      where: { id: id.value },
      include: { items: { include: { product: true } } },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByNumber(returnNumber: string): Promise<Return | null> {
    const record = await this.prisma.return.findUnique({
      where: { returnNumber },
      include: { items: { include: { product: true } } },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByInvoiceId(invoiceId: InvoiceId): Promise<Return[]> {
    const records = await this.prisma.return.findMany({
      where: { invoiceId: invoiceId.value },
      include: { items: { include: { product: true } } },
    });
    return records.map(this.toDomain);
  }

  async save(returnEntity: Return): Promise<void> {
    const data = this.toPersistence(returnEntity);
    const { items, ...returnData } = data;

    await this.prisma.$transaction(async (tx) => {
      await tx.return.upsert({
        where: { id: returnEntity.id.value },
        create: returnData,
        update: returnData,
      });

      // Sync items
      await tx.returnItem.deleteMany({
        where: { returnId: returnEntity.id.value },
      });

      if (items.length > 0) {
        await tx.returnItem.createMany({
          data: items.map((item: any) => ({
            ...item,
            returnId: returnEntity.id.value,
          })),
        });
      }
    });
  }

  async delete(id: ReturnId): Promise<void> {
    await this.prisma.return.delete({
      where: { id: id.value },
    });
  }

  async findAll(params: PaginationParams, criteria?: ReturnSearchCriteria): Promise<PaginatedResult<Return>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (criteria?.customerId) where.customerId = criteria.customerId.value;
    if (criteria?.invoiceId) where.invoiceId = criteria.invoiceId.value;
    if (criteria?.status) where.status = criteria.status;
    if (criteria?.dateFrom || criteria?.dateTo) {
      where.createdAt = {};
      if (criteria.dateFrom) where.createdAt.gte = criteria.dateFrom;
      if (criteria.dateTo) where.createdAt.lte = criteria.dateTo;
    }
    if (criteria?.search) {
      where.OR = [
        { returnNumber: { contains: criteria.search, mode: 'insensitive' } },
        { reason: { contains: criteria.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.return.findMany({
        where,
        skip,
        take: limit,
        include: { items: { include: { product: true } } },
        orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.return.count({ where }),
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

  async findByCustomer(customerId: CustomerId, params: PaginationParams): Promise<PaginatedResult<Return>> {
    return this.findAll(params, { customerId });
  }

  async findByStatus(status: ReturnStatus, params: PaginationParams): Promise<PaginatedResult<Return>> {
    return this.findAll(params, { status });
  }

  private toDomain(record: any): Return {
    const items = (record.items || []).map(
      (item: any) =>
        new ReturnItem(
          item.id,
          new ProductId(item.productId),
          item.product?.name || 'Product',
          Quantity.create(item.quantity).unwrap(),
          Money.reconstitute(Number(item.unitPrice), 'USD'),
          item.reason,
          item.condition as ReturnCondition
        )
    );

    return Return.reconstitute({
      id: new ReturnId(record.id),
      returnNumber: record.returnNumber,
      invoiceId: new InvoiceId(record.invoiceId),
      customerId: new CustomerId(record.customerId),
      userId: new UserId(record.userId),
      status: record.status as ReturnStatus,
      reason: record.reason,
      items,
      total: Money.reconstitute(Number(record.total), 'USD'),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toPersistence(returnEntity: Return): any {
    return {
      id: returnEntity.id.value,
      returnNumber: returnEntity.returnNumber,
      invoiceId: returnEntity.invoiceId.value,
      customerId: returnEntity.customerId.value,
      userId: returnEntity.userId.value,
      status: returnEntity.status,
      reason: returnEntity.reason,
      total: returnEntity.total._value,
      createdAt: returnEntity.createdAt,
      updatedAt: returnEntity.updatedAt,
      items: returnEntity.items.map((item) => ({
        id: item.id,
        productId: item.productId.value,
        quantity: item.quantity._value,
        unitPrice: item.unitPrice._value,
        reason: item.reason,
        condition: item.condition,
      })),
    };
  }
}
