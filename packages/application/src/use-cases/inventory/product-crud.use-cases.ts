import { inject, injectable } from 'inversify';
import { Result, PaginatedResult } from '@aquasystem/shared-kernel';
import { ProductRepositoryPort } from '@aquasystem/domain';
import { ProductQuery, ProductDto, UpdateProductCommand } from '../../dto/inventory.dto';
import { UseCase } from '../ports/inbound/use-case.port';
import { TYPES } from '../../types';
import { ProductId, SKU } from '@aquasystem/domain';
import { PersonName } from '@aquasystem/domain';
import { Money, Quantity } from '@aquasystem/domain';
import { ProductCategory, UnitOfMeasure } from '@aquasystem/shared-kernel';
import { EventBusPort } from '../ports/outbound';
import { ProductUpdatedEvent, ProductActivatedEvent, ProductDeactivatedEvent } from '@aquasystem/domain';

@injectable()
export class GetProductUseCase implements UseCase<string, ProductDto> {
  constructor(
    @inject(TYPES.ProductRepositoryPort) private readonly productRepo: ProductRepositoryPort
  ) {}

  async execute(id: string): Promise<Result<ProductDto>> {
    const productId = ProductId.create(id);
    const product = await this.productRepo.findById(productId);
    if (!product) {
      return Result.fail(new Error('Product not found'));
    }
    return Result.ok(this.toDto(product));
  }

  private toDto(product: any): ProductDto {
    return {
      id: product.id.value,
      sku: product.sku.value,
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      price: product.price._value,
      cost: product.cost._value,
      margin: product.margin._value,
      marginPercentage: product.marginPercentage,
      minStock: product.minStock._value,
      maxStock: product.maxStock?._value ?? null,
      isActive: product.isActive,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

@injectable()
export class ListProductsUseCase implements UseCase<ProductQuery, PaginatedResult<ProductDto>> {
  constructor(
    @inject(TYPES.ProductRepositoryPort) private readonly productRepo: ProductRepositoryPort
  ) {}

  async execute(query: ProductQuery): Promise<Result<PaginatedResult<ProductDto>>> {
    const result = await this.productRepo.findAll(query, {
      category: query.category,
      isActive: query.isActive,
      search: query.search,
      lowStock: query.lowStock,
    });
    return Result.ok({
      data: result.data.map(this.toDto),
      meta: result.meta,
    });
  }

  private toDto(product: any): ProductDto {
    return {
      id: product.id.value,
      sku: product.sku.value,
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      price: product.price._value,
      cost: product.cost._value,
      margin: product.margin._value,
      marginPercentage: product.marginPercentage,
      minStock: product.minStock._value,
      maxStock: product.maxStock?._value ?? null,
      isActive: product.isActive,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

@injectable()
export class UpdateProductUseCase implements UseCase<UpdateProductCommand, ProductDto> {
  constructor(
    @inject(TYPES.ProductRepositoryPort) private readonly productRepo: ProductRepositoryPort,
    @inject(TYPES.EventBusPort) private readonly eventBus: EventBusPort
  ) {}

  async execute(command: UpdateProductCommand): Promise<Result<ProductDto>> {
    const productId = ProductId.create(command.id);
    const product = await this.productRepo.findById(productId);
    if (!product) {
      return Result.fail(new Error('Product not found'));
    }

    const updateData: any = {};
    if (command.name) {
      const nameResult = PersonName.create(command.name);
      if (!nameResult.ok) return Result.fail(nameResult.error);
      updateData.name = command.name;
    }
    if (command.description !== undefined) updateData.description = command.description;
    if (command.category) updateData.category = command.category;
    if (command.unit) updateData.unit = command.unit;
    if (command.price !== undefined) updateData.price = command.price;
    if (command.cost !== undefined) updateData.cost = command.cost;
    if (command.minStock !== undefined) updateData.minStock = command.minStock;
    if (command.maxStock !== undefined) updateData.maxStock = command.maxStock;
    if (command.imageUrl !== undefined) updateData.imageUrl = command.imageUrl;

    const result = product.updateDetails(updateData);
    if (!result.ok) return Result.fail(result.error);

    await this.productRepo.save(product);
    await this.eventBus.publish(new ProductUpdatedEvent(product.id));

    return Result.ok(this.toDto(product));
  }

  private toDto(product: any): ProductDto {
    return {
      id: product.id.value,
      sku: product.sku.value,
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      price: product.price._value,
      cost: product.cost._value,
      margin: product.margin._value,
      marginPercentage: product.marginPercentage,
      minStock: product.minStock._value,
      maxStock: product.maxStock?._value ?? null,
      isActive: product.isActive,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

@injectable()
export class DeleteProductUseCase implements UseCase<string, void> {
  constructor(
    @inject(TYPES.ProductRepositoryPort) private readonly productRepo: ProductRepositoryPort,
    @inject(TYPES.EventBusPort) private readonly eventBus: EventBusPort
  ) {}

  async execute(id: string): Promise<Result<void>> {
    const productId = ProductId.create(id);
    const product = await this.productRepo.findById(productId);
    if (!product) {
      return Result.fail(new Error('Product not found'));
    }

    product.deactivate();
    await this.productRepo.save(product);
    await this.eventBus.publish(new ProductDeactivatedEvent(product.id));

    return Result.ok(undefined);
  }
}