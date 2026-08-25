import { BaseFeathersService } from './base.service';
import { container, TYPES } from '../../config/di.container';

export class SettingsService extends BaseFeathersService<any, any, any, any> {
  protected getUseCaseTokens() {
    return {
      get: TYPES.GetSettingsUseCase,
      find: TYPES.ListSettingsUseCase,
      create: TYPES.UpdateSettingUseCase,
      update: TYPES.UpdateSettingUseCase,
      patch: TYPES.UpdateSettingUseCase,
      remove: TYPES.DeleteSettingUseCase,
    };
  }

  async find(params?: any): Promise<any> {
    const query = {
      isPublic: params?.query?.isPublic,
    };
    return super.find(query);
  }

  async get(id: string, params?: any): Promise<any> {
    return super.get(id, params);
  }

  async create(data: any, params?: any): Promise<any> {
    const command = {
      key: data.key,
      value: data.value,
      type: data.type,
      description: data.description,
      isPublic: data.isPublic,
    };
    return super.create(command, params);
  }

  async patch(id: string, data: any, params?: any): Promise<any> {
    const command = { key: id, ...data };
    return super.patch(id, command, params);
  }

  async remove(id: string, params?: any): Promise<any> {
    return super.remove(id, params);
  }
}