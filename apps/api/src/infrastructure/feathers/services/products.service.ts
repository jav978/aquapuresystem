import { BaseFeathersService } from './base.service';
import { container, TYPES } from '../../config/di.container';
import { Product } from '@aquasystem/domain';

export class ProductsService extends BaseFeathersService<Product, any, any, any> {
  protected getUseCaseTokens() {
    return {
      get: TYPES.GetProductUseCase,
      find: TYPES.ListProductsUseCase,
      create: TYPES.CreateProductUseCase,
      update: TYPES.UpdateProductUseCase,
      patch: TYPES.UpdateProductUseCase,
      remove: TYPES.DeleteProductUseCase,
    };
  }

  async find(params?: any): Promise<any> {
    const query = {
      page: params?.query?.$page || 1,
      limit: params?.query?.$limit || 20,
      sortBy: params?.query?.$sort?.field,
      sortOrder: params?.query?.$sort?.order,
      category: params?.query?.category,
      isActive: params?.query?.isActive,
      search: params?.query?.search,
      lowStock: params?.query?.lowStock,
    };
    return super.find(query);
  }

  async get(id: string, params?: any): Promise<any> {
    return super.get(id, params);
  }

  async create(data: any, params?: any): Promise<any> {
    const command = {
      sku: data.sku,
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