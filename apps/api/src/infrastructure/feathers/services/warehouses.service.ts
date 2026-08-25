import { BaseFeathersService } from './base.service';
import { container, TYPES } from '../../config/di.container';

export class WarehousesService extends BaseFeathersService<any, any, any, any> {
  protected getUseCaseTokens() {
    return {
      get: TYPES.GetWarehouseUseCase,
      find: TYPES.ListWarehousesUseCase,
      create: TYPES.CreateWarehouseUseCase,
      update: TYPES.UpdateWarehouseUseCase,
      patch: TYPES.UpdateWarehouseUseCase,
      remove: TYPES.DeleteWarehouseUseCase,
    };
  }

  async find(params?: any): Promise<any> {
    const query = {
      page: params?.query?.$page || 1,
      limit: params?.query?.$limit || 20,
      sortBy: params?.query?.$sort?.field,
      sortOrder: params?.query?.$sort?.order,
      isActive: params?.query?.isActive,
      search: params?.query?.search,
    };
    return super.find(query);
  }

  async get(id: string, params?: any): Promise<any> {
    return super.get(id, params);
  }

  async create(data: any, params?: any): Promise<any> {
    const command = { name: data.name, code: data.code, address: data.address };
    return super.create(command, params);
  }

  async patch(id: string, data: any, params?: any): Promise<any> {
    const command = { id, name: data.name, address: data.address };
    return super.patch(id, command, params);
  }

  async remove(id: string, params?: any): Promise<any> {
    return super.remove(id, params);
  }
}