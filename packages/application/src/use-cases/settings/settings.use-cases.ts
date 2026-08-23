import { inject, injectable } from 'inversify';
import { Result, PaginatedResult } from '@aquasystem/shared-kernel';
import { SettingRepositoryPort, SystemSetting, SettingType } from '@aquasystem/domain';
import { GetSettingsQuery, UpdateSettingCommand, SettingDto, AuditLogQuery, AuditLogDto } from '../../dto/settings.dto';
import { UseCase } from '../ports/inbound/use-case.port';
import { TYPES } from '../../types';
import { EventBusPort } from '../ports/outbound';

@injectable()
export class GetSettingsUseCase implements UseCase<GetSettingsQuery, SettingDto[]> {
  constructor(
    @inject(TYPES.SettingRepositoryPort) private readonly settingRepo: SettingRepositoryPort
  ) {}

  async execute(query: GetSettingsQuery): Promise<Result<SettingDto[]>> {
    const settings = query.isPublic !== undefined
      ? await this.settingRepo.findPublic()
      : (await this.settingRepo.findAll({ page: 1, limit: 100 })).data;

    return Result.ok(settings.map(this.toDto));
  }

  private toDto(setting: SystemSetting): SettingDto {
    return {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      type: setting.type,
      description: setting.description,
      isPublic: setting.isPublic,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    };
  }
}

@injectable()
export class UpdateSettingUseCase implements UseCase<UpdateSettingCommand, SettingDto> {
  constructor(
    @inject(TYPES.SettingRepositoryPort) private readonly settingRepo: SettingRepositoryPort,
    @inject(TYPES.EventBusPort) private readonly eventBus: EventBusPort
  ) {}

  async execute(command: UpdateSettingCommand): Promise<Result<SettingDto>> {
    let existing = await this.settingRepo.findByKey(command.key);

    if (existing) {
      existing.value = command.value;
      existing.type = command.type;
      existing.description = command.description || null;
      existing.isPublic = command.isPublic;
      existing.updatedAt = new Date();
      await this.settingRepo.save(existing);
      return Result.ok(this.toDto(existing));
    }

    const newSetting: SystemSetting = {
      id: crypto.randomUUID(),
      key: command.key,
      value: command.value,
      type: command.type,
      description: command.description || null,
      isPublic: command.isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.settingRepo.save(newSetting);
    return Result.ok(this.toDto(newSetting));
  }

  private toDto(setting: SystemSetting): SettingDto {
    return {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      type: setting.type,
      description: setting.description,
      isPublic: setting.isPublic,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    };
  }
}

@injectable()
export class GetAuditLogUseCase implements UseCase<AuditLogQuery, PaginatedResult<AuditLogDto>> {
  constructor(
    @inject(TYPES.SettingRepositoryPort) private readonly settingRepo: SettingRepositoryPort
  ) {}

  async execute(query: AuditLogQuery): Promise<Result<PaginatedResult<AuditLogDto>>> {
    // In production, this would query a dedicated audit log repository
    // For now, return empty result
    return Result.ok({
      data: [],
      meta: {
        page: query.page,
        limit: query.limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    });
  }
}