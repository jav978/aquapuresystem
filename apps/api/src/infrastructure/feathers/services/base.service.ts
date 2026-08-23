import { ServiceInterface } from '@feathersjs/feathers';
import { container, TYPES } from '../config/di.container';
import { Result } from '@aquasystem/shared-kernel';

export abstract class BaseFeathersService<T, TCreate, TUpdate, TQuery> implements ServiceInterface<T, TQuery> {
  protected abstract getUseCaseTokens(): {
    get: symbol;
    find: symbol;
    create: symbol;
    update: symbol;
    patch: symbol;
    remove: symbol;
  };

  protected get useCaseTokens() {
    return this.getUseCaseTokens();
  }

  async find(params?: TQuery): Promise<any> {
    const useCase = container.get(this.useCaseTokens.find);
    const result = await useCase.execute(params || {} as any);
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  }

  async get(id: string, params?: TQuery): Promise<T> {
    const useCase = container.get(this.useCaseTokens.get);
    const result = await useCase.execute({ id });
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  }

  async create(data: TCreate, params?: TQuery): Promise<T> {
    const useCase = container.get(this.useCaseTokens.create);
    const result = await useCase.execute({ ...data, ...params } as any);
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  }

  async update(id: string, data: TUpdate, params?: TQuery): Promise<T> {
    const useCase = container.get(this.useCaseTokens.update);
    const result = await useCase.execute({ id, ...data } as any);
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  }

  async patch(id: string, data: Partial<TUpdate>, params?: TQuery): Promise<T> {
    const useCase = container.get(this.useCaseTokens.patch);
    const result = await useCase.execute({ id, ...data } as any);
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  }

  async remove(id: string, params?: TQuery): Promise<T> {
    const useCase = container.get(this.useCaseTokens.remove);
    const result = await useCase.execute({ id });
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  }
}