import { BaseFeathersService } from './base.service';
import { container, TYPES } from '../config/di.container';

export class PaymentsService extends BaseFeathersService<any, any, any, any> {
  protected getUseCaseTokens() {
    return {
      get: TYPES.GetPaymentUseCase,
      find: TYPES.ListPaymentsUseCase,
      create: TYPES.AddPaymentUseCase,
      update: TYPES.UpdatePaymentUseCase,
      patch: TYPES.UpdatePaymentUseCase,
      remove: TYPES.DeletePaymentUseCase,
    };
  }

  async find(params?: any): Promise<any> {
    const query = {
      page: params?.query?.$page || 1,
      limit: params?.query?.$limit || 20,
      sortBy: params?.query?.$sort?.field,
      sortOrder: params?.query?.$sort?.order,
      invoiceId: params?.query?.invoiceId,
      method: params?.query?.method,
      status: params?.query?.status,
    };
    return super.find(query);
  }

  async get(id: string, params?: any): Promise<any> {
    return super.get(id, params);
  }

  async create(data: any, params?: any): Promise<any> {
    const command = {
      invoiceId: data.invoiceId,
      amount: data.amount,
      method: data.method,
      reference: data.reference,
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