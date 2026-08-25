import { inject, injectable } from 'inversify';
import { PrismaService } from '@aquasystem/infrastructure';
import { SettingRepositoryPort, SettingSearchCriteria, SystemSetting, SettingType } from '@aquasystem/domain';
import { PaginatedResult, PaginationParams } from '@aquasystem/shared-kernel';

@injectable()
export class PrismaSettingRepository implements SettingRepositoryPort {
  constructor(@inject('PrismaService') private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SystemSetting | null> {
    const record = await this.prisma.systemSetting.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByKey(key: string): Promise<SystemSetting | null> {
    const record = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(setting: SystemSetting): Promise<void> {
    const data = {
      key: setting.key,
      value: setting.value,
      type: setting.type as any,
      description: setting.description,
      isPublic: setting.isPublic,
    };

    await this.prisma.systemSetting.upsert({
      where: { key: setting.key },
      create: { id: setting.id || undefined, ...data },
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.systemSetting.delete({
      where: { id },
    });
  }

  async findAll(params: PaginationParams, criteria?: SettingSearchCriteria): Promise<PaginatedResult<SystemSetting>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (criteria?.isPublic !== undefined) where.isPublic = criteria.isPublic;
    if (criteria?.search) {
      where.OR = [
        { key: { contains: criteria.search, mode: 'insensitive' } },
        { description: { contains: criteria.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.systemSetting.findMany({
        where,
        skip,
        take: limit,
        orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { key: 'asc' },
      }),
      this.prisma.systemSetting.count({ where }),
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

  async findPublic(): Promise<SystemSetting[]> {
    const records = await this.prisma.systemSetting.findMany({
      where: { isPublic: true },
      orderBy: { key: 'asc' },
    });
    return records.map(this.toDomain);
  }

  private toDomain(record: any): SystemSetting {
    return {
      id: record.id,
      key: record.key,
      value: record.value,
      type: record.type as SettingType,
      description: record.description,
      isPublic: record.isPublic,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
