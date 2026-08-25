import { inject, injectable } from 'inversify';
import { PrismaService } from '@aquasystem/infrastructure';
import { InvoiceRepositoryPort, InvoiceSearchCriteria } from '@aquasystem/domain';
import { Invoice, InvoiceId, SaleId, CustomerId, UserId, ProductId, InvoiceItem, Payment, Money, Quantity } from '@aquasystem/domain';
import { PaginatedResult, PaginationParams, InvoiceStatus, PaymentStatus } from '@aquasystem/shared-kernel';

@injectable()
export class PrismaInvoiceRepository implements InvoiceRepositoryPort {
  constructor(@inject('PrismaService') private readonly prisma: PrismaService) {}

  async findById(id: InvoiceId): Promise<Invoice | null> {
    const record = await this.prisma.invoice.findUnique({
      where: { id: id.value },
      include: {
        items: { include: { product: true } },
        payments: true,
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByNumber(invoiceNumber: string): Promise<Invoice | null> {
    const record = await this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        items: { include: { product: true } },
        payments: true,
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async findBySaleId(saleId: SaleId): Promise<Invoice | null> {
    const record = await this.prisma.invoice.findUnique({
      where: { saleId: saleId.value },
      include: {
        items: { include: { product: true } },
        payments: true,
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(invoice: Invoice): Promise<void> {
    const data = this.toPersistence(invoice);
    const { items, payments, ...invoiceData } = data;

    await this.prisma.$transaction(async (tx) => {
      await tx.invoice.upsert({
        where: { id: invoice.id.value },
        create: invoiceData,
        update: invoiceData,
      });

      // Sync items
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: invoice.id.value },
      });

      if (items.length > 0) {
        await tx.invoiceItem.createMany({
          data: items.map((item: any) => ({
            ...item,
            invoiceId: invoice.id.value,
          })),
        });
      }
    });
  }

  async delete(id: InvoiceId): Promise<void> {
    await this.prisma.invoice.delete({
      where: { id: id.value },
    });
  }

  async findAll(params: PaginationParams, criteria?: InvoiceSearchCriteria): Promise<PaginatedResult<Invoice>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (criteria?.customerId) where.customerId = criteria.customerId.value;
    if (criteria?.userId) where.userId = criteria.userId.value;
    if (criteria?.saleId) where.saleId = criteria.saleId.value;
    if (criteria?.status) where.status = criteria.status;
    if (criteria?.dateFrom || criteria?.dateTo) {
      where.issueDate = {};
      if (criteria.dateFrom) where.issueDate.gte = criteria.dateFrom;
      if (criteria.dateTo) where.issueDate.lte = criteria.dateTo;
    }
    if (criteria?.search) {
      where.OR = [
        { invoiceNumber: { contains: criteria.search, mode: 'insensitive' } },
        { customer: { name: { contains: criteria.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: { include: { product: true } },
          payments: true,
        },
        orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
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

  async findByCustomer(customerId: CustomerId, params: PaginationParams): Promise<PaginatedResult<Invoice>> {
    return this.findAll(params, { customerId });
  }

  async findByStatus(status: InvoiceStatus, params: PaginationParams): Promise<PaginatedResult<Invoice>> {
    return this.findAll(params, { status });
  }

  async findOverdue(params: PaginationParams): Promise<PaginatedResult<Invoice>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    const where = {
      status: { notIn: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED, InvoiceStatus.REFUNDED] },
      dueDate: { lt: new Date() },
    };

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: { include: { product: true } },
          payments: true,
        },
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.invoice.count({ where }),
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

  async findByDateRange(dateFrom: Date, dateTo: Date, params: PaginationParams): Promise<PaginatedResult<Invoice>> {
    return this.findAll(params, { dateFrom, dateTo });
  }

  private toDomain(record: any): Invoice {
    const items = (record.items || []).map(
      (item: any) =>
        new InvoiceItem(
          item.id,
          new ProductId(item.productId),
          item.product?.name || 'Product',
          Quantity.create(item.quantity).unwrap(),
          Money.reconstitute(Number(item.unitPrice), 'USD'),
          Money.reconstitute(Number(item.discount || 0), 'USD'),
          Number(item.taxRate || 21),
          Money.reconstitute(Number(item.total), 'USD')
        )
    );

    const payments = (record.payments || []).map(
      (payment: any) =>
        new Payment(
          payment.id,
          payment.paymentNumber,
          Money.reconstitute(Number(payment.amount), 'USD'),
          payment.method,
          payment.reference,
          payment.status as PaymentStatus,
          payment.paidAt,
          payment.createdAt
        )
    );

    return Invoice.reconstitute({
      id: new InvoiceId(record.id),
      invoiceNumber: record.invoiceNumber,
      saleId: record.saleId ? new SaleId(record.saleId) : null,
      customerId: new CustomerId(record.customerId),
      userId: new UserId(record.userId),
      status: record.status as InvoiceStatus,
      items,
      subtotal: Money.reconstitute(Number(record.subtotal), 'USD'),
      taxAmount: Money.reconstitute(Number(record.taxAmount), 'USD'),
      total: Money.reconstitute(Number(record.total), 'USD'),
      payments,
      issueDate: record.issueDate,
      dueDate: record.dueDate,
      paidDate: record.paidDate,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toPersistence(invoice: Invoice): any {
    return {
      id: invoice.id.value,
      invoiceNumber: invoice.invoiceNumber,
      saleId: invoice.saleId?.value ?? null,
      customerId: invoice.customerId.value,
      userId: invoice.userId.value,
      status: invoice.status,
      subtotal: invoice.subtotal._value,
      taxAmount: invoice.taxAmount._value,
      total: invoice.total._value,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      items: invoice.items.map((item) => ({
        id: item.id,
        productId: item.productId.value,
        quantity: item.quantity._value,
        unitPrice: item.unitPrice._value,
        discount: item.discount._value,
        taxRate: item.taxRate,
        total: item.total._value,
      })),
      payments: invoice.payments.map((p) => ({
        id: p.id,
        paymentNumber: p.paymentNumber,
        amount: p.amount._value,
        method: p.method,
        reference: p.reference,
        status: p.status,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
    };
  }
}
