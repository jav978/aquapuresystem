import { PrismaService } from './prisma.service';
import { Result, PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';

export abstract class BaseRepository<T, TCreate, TUpdate, TId> {
  protected constructor(protected readonly prisma: PrismaService, protected readonly modelName: string) {}

  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  async findById(id: TId): Promise<T | null> {
    const record = await this.model.findUnique({
      where: { id: String(id) },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(params: PaginationParams, where?: any): Promise<PaginatedResult<T>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : undefined,
      }),
      this.model.count({ where }),
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

  async save(entity: T): Promise<void> {
    const data = this.toPersistence(entity);
    await this.model.upsert({
      where: { id: this.getId(entity) },
      create: data,
      update: data,
    });
  }

  async delete(id: TId): Promise<void> {
    await this.model.delete({
      where: { id: String(id) },
    });
  }

  protected abstract toDomain(record: any): T;
  protected abstract toPersistence(entity: T): any;
  protected abstract getId(entity: T): string;
}

export class TransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  async runInTransaction<T>(callback: (tx: PrismaService) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => callback(tx as any));
  }
}