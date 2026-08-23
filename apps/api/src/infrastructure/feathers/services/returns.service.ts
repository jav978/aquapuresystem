import { BaseFeathersService } from './base.service';
import { container, TYPES } from '../config/di.container';

export class ReturnsService extends BaseFeathersService<any, any, any, any> {
  protected getUseCaseTokens() {
    return {
      get: TYPES.GetReturnUseCase,
      find: TYPES.ListReturnsUseCase,
      create: TYPES.CreateReturnUseCase,
      update: TYPES.ProcessReturnUseCase,
      patch: TYPES.ProcessReturnUseCase,
      remove: TYPES.DeleteReturnUseCase,
    };
  }

  async find(params?: any): Promise<any> {
    const query = {
      page: params?.query?.$page || 1,
      limit: params?.query?.$limit || 20,
      sortBy: params?.query?.$sort?.field,
      sortOrder: params?.query?.$sort?.order,
      customerId: params?.query?.customerId,
      invoiceId: params?.query?.invoiceId,
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
      invoiceId: data.invoiceId,
      customerId: data.customerId,
      userId: data.userId || params?.user?.id,
      reason: data.reason,
      items: data.items,
    };
    return super.create(command, params);
  }

  async patch(id: string, data: any, params?: any): Promise<any> {
    const command = { id, action: data.action, reason: data.reason };
    return super.patch(id, command, params);
  }

  async remove(id: string, params?: any): Promise<any> {
    return super.remove(id, params);
  }
}