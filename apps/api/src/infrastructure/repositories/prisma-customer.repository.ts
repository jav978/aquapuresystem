import { inject, injectable } from 'inversify';
import { PrismaService } from '@aquasystem/infrastructure';
import { CustomerRepositoryPort, CustomerSearchCriteria } from '@aquasystem/domain';
import { Customer, CustomerId, Email, Money } from '@aquasystem/domain';
import { PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';

@injectable()
export class PrismaCustomerRepository implements CustomerRepositoryPort {
  constructor(@inject('PrismaService') private readonly prisma: PrismaService) {}

  async findById(id: CustomerId): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({
      where: { id: id.value },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByCode(code: string): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({
      where: { code: code.toUpperCase() },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const record = await this.prisma.customer.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(customer: Customer): Promise<void> {
    const data = this.toPersistence(customer);
    await this.prisma.customer.upsert({
      where: { id: customer.id.value },
      create: data,
      update: data,
    });
  }

  async delete(id: CustomerId): Promise<void> {
    await this.prisma.customer.delete({
      where: { id: id.value },
    });
  }

  async findAll(params: PaginationParams, criteria?: CustomerSearchCriteria): Promise<PaginatedResult<Customer>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (criteria?.isActive !== undefined) where.isActive = criteria.isActive;
    if (criteria?.search) {
      where.OR = [
        { name: { contains: criteria.search, mode: 'insensitive' } },
        { code: { contains: criteria.search, mode: 'insensitive' } },
        { email: { contains: criteria.search, mode: 'insensitive' } },
        { phone: { contains: criteria.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
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

  private toDomain(record: any): Customer {
    const emailResult = record.email ? Email.createUnsafe(record.email) : null;
    const creditLimit = Money.reconstitute(Number(record.creditLimit), 'USD');

    return Customer.reconstitute({
      id: new CustomerId(record.id),
      code: record.code,
      name: record.name,
      email: emailResult,
      phone: record.phone,
      address: record.address,
      taxId: record.taxId,
      creditLimit,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toPersistence(customer: Customer): any {
    return {
      id: customer.id.value,
      code: customer.code,
      name: customer.name,
      email: customer.email?.value ?? null,
      phone: customer.phone,
      address: customer.address,
      taxId: customer.taxId,
      creditLimit: customer.creditLimit._value,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
