import { inject, injectable } from 'inversify';
import { PrismaService } from '@aquasystem/infrastructure';
import { UserRepositoryPort } from '@aquasystem/domain';
import { User, UserId, Email } from '@aquasystem/domain';
import { PaginatedResult, PaginationParams, UserSearchCriteria } from '@aquasystem/shared-kernel';

@injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(@inject('PrismaService') private readonly prisma: PrismaService) {}

  async findById(id: UserId): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id: id.value },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.value },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(user: User): Promise<void> {
    const data = this.toPersistence(user);
    await this.prisma.user.upsert({
      where: { id: user.id.value },
      create: data,
      update: data,
    });
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.value },
    });
  }

  async findAll(params: PaginationParams, criteria?: UserSearchCriteria): Promise<PaginatedResult<User>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (criteria?.role) where.role = criteria.role;
    if (criteria?.isActive !== undefined) where.isActive = criteria.isActive;
    if (criteria?.search) {
      where.OR = [
        { email: { contains: criteria.search, mode: 'insensitive' } },
        { firstName: { contains: criteria.search, mode: 'insensitive' } },
        { lastName: { contains: criteria.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
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

  private toDomain(record: any): User {
    return User.reconstitute({
      id: new UserId(record.id),
      email: Email.createUnsafe(record.email),
      passwordHash: record.passwordHash,
      firstName: record.firstName,
      lastName: record.lastName,
      role: record.role,
      isActive: record.isActive,
      lastLoginAt: record.lastLoginAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toPersistence(user: User): any {
    return {
      id: user.id.value,
      email: user.email.value,
      passwordHash: user.passwordHash.value,
      firstName: user.firstName.value,
      lastName: user.lastName.value,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}