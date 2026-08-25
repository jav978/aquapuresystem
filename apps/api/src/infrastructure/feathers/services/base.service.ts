import { ServiceInterface } from '@feathersjs/feathers';
import { BadRequest, NotFound, GeneralError } from '@feathersjs/errors';
import { container } from '../../config/di.container';
import { logger } from '@aquasystem/infrastructure';

export abstract class BaseFeathersService<T, TCreate, TUpdate, TQuery> implements ServiceInterface<T, TQuery> {
  id: string = 'id';
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
    try {
      const useCase = container.get(this.useCaseTokens.find);
      const result = await useCase.execute(params || ({} as any));
      if (!result.ok) {
        logger.warn({ error: result.error }, 'Error en consulta find');
        throw new BadRequest(result.error.message || 'Error en la consulta');
      }
      return result.value;
    } catch (err: any) {
      if (err.className) throw err; // Feathers error already
      logger.error({ err, params }, 'Excepción no controlada en find()');
      throw new GeneralError(err.message || 'Error interno al consultar los registros');
    }
  }

  async get(id: string, params?: TQuery): Promise<T> {
    try {
      const useCase = container.get(this.useCaseTokens.get);
      const result = await useCase.execute({ id });
      if (!result.ok) {
        logger.warn({ error: result.error, id }, 'Registro no encontrado en get()');
        throw new NotFound(result.error.message || `Registro con ID ${id} no encontrado`);
      }
      return result.value;
    } catch (err: any) {
      if (err.className) throw err;
      logger.error({ err, id }, 'Excepción no controlada en get()');
      throw new GeneralError(err.message || 'Error al obtener el registro');
    }
  }

  async create(data: TCreate, params?: TQuery): Promise<T> {
    try {
      const useCase = container.get(this.useCaseTokens.create);
      const result = await useCase.execute({ ...data, ...params } as any);
      if (!result.ok) {
        logger.warn({ error: result.error, data }, 'Error de validación o ejecución en create()');
        throw new BadRequest(result.error.message || 'Datos de creación inválidos');
      }
      return result.value;
    } catch (err: any) {
      if (err.className) throw err;
      logger.error({ err, data }, 'Excepción no controlada en create()');
      throw new GeneralError(err.message || 'Error al crear el registro en la base de datos');
    }
  }

  async update(id: string, data: TUpdate, params?: TQuery): Promise<T> {
    try {
      const useCase = container.get(this.useCaseTokens.update);
      const result = await useCase.execute({ id, ...data } as any);
      if (!result.ok) {
        logger.warn({ error: result.error, id, data }, 'Error en update()');
        throw new BadRequest(result.error.message || 'Error al actualizar el registro');
      }
      return result.value;
    } catch (err: any) {
      if (err.className) throw err;
      logger.error({ err, id, data }, 'Excepción no controlada en update()');
      throw new GeneralError(err.message || 'Error al actualizar el registro en la base de datos');
    }
  }

  async patch(id: string, data: Partial<TUpdate>, params?: TQuery): Promise<T> {
    try {
      const useCase = container.get(this.useCaseTokens.patch);
      const result = await useCase.execute({ id, ...data } as any);
      if (!result.ok) {
        logger.warn({ error: result.error, id, data }, 'Error en patch()');
        throw new BadRequest(result.error.message || 'Error al modificar parcialmente el registro');
      }
      return result.value;
    } catch (err: any) {
      if (err.className) throw err;
      logger.error({ err, id, data }, 'Excepción no controlada en patch()');
      throw new GeneralError(err.message || 'Error al modificar el registro en la base de datos');
    }
  }

  async remove(id: string, params?: TQuery): Promise<T> {
    try {
      const useCase = container.get(this.useCaseTokens.remove);
      const result = await useCase.execute({ id });
      if (!result.ok) {
        logger.warn({ error: result.error, id }, 'Error en remove()');
        throw new BadRequest(result.error.message || 'Error al eliminar el registro');
      }
      return result.value;
    } catch (err: any) {
      if (err.className) throw err;
      logger.error({ err, id }, 'Excepción no controlada en remove()');
      throw new GeneralError(err.message || 'Error al eliminar el registro en la base de datos');
    }
  }
}