import { BaseFeathersService } from './base.service';
import { container, TYPES } from '../../config/di.container';

export class InventoryMovementsService extends BaseFeathersService<any, any, any, any> {
  protected getUseCaseTokens() {
    return {
      get: TYPES.GetInventoryMovementUseCase,
      find: TYPES.GetInventoryMovementsUseCase,
      create: TYPES.CreateInventoryMovementUseCase,
      update: TYPES.UpdateInventoryMovementUseCase,
      patch: TYPES.UpdateInventoryMovementUseCase,
      remove: TYPES.DeleteInventoryMovementUseCase,
    };
  }

  async find(params?: any): Promise<any> {
    const query = {
      page: params?.query?.$page || 1,
      limit: params?.query?.$limit || 20,
      sortBy: params?.query?.$sort?.field,
      sortOrder: params?.query?.$sort?.order,
      productId: params?.query?.productId,
      warehouseId: params?.query?.warehouseId,
      type: params?.query?.type,
      dateFrom: params?.query?.dateFrom,
      dateTo: params?.query?.dateTo,
    };
    return super.find(query);
  }

  async get(id: string, params?: any): Promise<any> {
    return super.get(id, params);
  }

  async create(data: any, params?: any): Promise<any> {
    const command = {
      productId: data.productId,
      warehouseId: data.warehouseId,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
      referenceId: data.referenceId,
      referenceType: data.referenceType,
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