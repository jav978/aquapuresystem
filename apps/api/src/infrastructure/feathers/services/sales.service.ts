import { BaseFeathersService } from './base.service';
import { container, TYPES } from '../../config/di.container';

export class SalesService extends BaseFeathersService<any, any, any, any> {
  protected getUseCaseTokens() {
    return {
      get: TYPES.GetSaleUseCase,
      find: TYPES.ListSalesUseCase,
      create: TYPES.CreateSaleUseCase,
      update: TYPES.UpdateSaleUseCase,
      patch: TYPES.UpdateSaleUseCase,
      remove: TYPES.DeleteSaleUseCase,
    };
  }

  async find(params?: any): Promise<any> {
    const query = {
      page: params?.query?.$page || 1,
      limit: params?.query?.$limit || 20,
      sortBy: params?.query?.$sort?.field,
      sortOrder: params?.query?.$sort?.order,
      customerId: params?.query?.customerId,
      userId: params?.query?.userId,
      status: params?.query?.status,
      dateFrom: params?.query?.dateFrom,
      dateTo: params?.query?.dateTo,
      search: params?.query?.search,
    };
    return super.find(query);
  }

  async get(id: string, params?: any): Promise<any> {
    return super.get(id, params);
  }

  async create(data: any, params?: any): Promise<any> {
    const command = {
      customerId: data.customerId,
      userId: data.userId || params?.user?.id,
      items: data.items,
      taxRate: data.taxRate,
      discount: data.discount,
      notes: data.notes,
    };
    return super.create(command, params);
  }

  async patch(id: string, data: any, params?: any): Promise<any> {
    const command = { id, ...data };
    return super.patch(id, command, params);
  }

  async remove(id: string, params?: any): Promise<any> {
    return super.remove(id, params);
  }
}