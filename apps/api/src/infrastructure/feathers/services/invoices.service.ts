import { BaseFeathersService } from './base.service';
import { container, TYPES } from '../config/di.container';

export class InvoicesService extends BaseFeathersService<any, any, any, any> {
  protected getUseCaseTokens() {
    return {
      get: TYPES.GetInvoiceDetailUseCase,
      find: TYPES.ListInvoicesUseCase,
      create: TYPES.CreateInvoiceUseCase,
      update: TYPES.UpdateInvoiceUseCase,
      patch: TYPES.UpdateInvoiceUseCase,
      remove: TYPES.DeleteInvoiceUseCase,
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
      saleId: params?.query?.saleId,
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
      saleId: data.saleId,
      customerId: data.customerId,
      userId: data.userId || params?.user?.id,
      items: data.items,
      dueDate: data.dueDate,
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