import { BaseFeathersService } from './base.service';
import { container, TYPES } from '../../config/di.container';
import { User } from '@aquasystem/domain';

export class UsersService extends BaseFeathersService<User, any, any, any> {
  protected getUseCaseTokens() {
    return {
      get: TYPES.GetUserUseCase,
      find: TYPES.ListUsersUseCase,
      create: TYPES.CreateUserUseCase,
      update: TYPES.UpdateUserUseCase,
      patch: TYPES.UpdateUserUseCase,
      remove: TYPES.DeleteUserUseCase,
    };
  }

  async find(params?: any): Promise<any> {
    const query = {
      page: params?.query?.$page || 1,
      limit: params?.query?.$limit || 20,
      sortBy: params?.query?.$sort?.field,
      sortOrder: params?.query?.$sort?.order,
      role: params?.query?.role,
      isActive: params?.query?.isActive,
      search: params?.query?.search,
    };
    return super.find(query);
  }

  async get(id: string, params?: any): Promise<any> {
    if (id === 'me') {
      if (params?.user) {
        return params.user;
      }
      throw new Error('No autenticado');
    }
    return super.get(id, params);
  }

  async create(data: any, params?: any): Promise<any> {
    const command = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    };
    return super.create(command, params);
  }

  async patch(id: string, data: any, params?: any): Promise<any> {
    const command = {
      id,
      name: data.name,
      description: data.description,
      category: data.category,
      unit: data.unit,
      price: data.price,
      cost: data.cost,
      minStock: data.minStock,
      maxStock: data.maxStock,
      imageUrl: data.imageUrl,
    };
    return super.patch(id, command, params);
  }

  async remove(id: string, params?: any): Promise<any> {
    return super.remove(id, params);
  }
}