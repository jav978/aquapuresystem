import { BaseFeathersService } from './base.service';
import { container, TYPES } from '../../config/di.container';

export class CustomersService extends BaseFeathersService<any, any, any, any> {
  protected getUseCaseTokens() {
    return {
      get: TYPES.GetCustomerUseCase,
      find: TYPES.ListCustomersUseCase,
      create: TYPES.CreateCustomerUseCase,
      update: TYPES.UpdateCustomerUseCase,
      patch: TYPES.UpdateCustomerUseCase,
      remove: TYPES.DeleteCustomerUseCase,
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
    const command = {
      code: data.code,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      taxId: data.taxId,
      creditLimit: data.creditLimit,
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