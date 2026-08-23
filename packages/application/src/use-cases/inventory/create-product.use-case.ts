import { inject, injectable } from 'inversify';
import { Result } from '@aquasystem/shared-kernel';
import { ProductRepositoryPort, WarehouseRepositoryPort } from '@aquasystem/domain';
import { CreateProductCommand, ProductDto, ProductQuery, UpdateProductCommand } from '../../dto/inventory.dto';
import { UseCase } from '../ports/inbound/use-case.port';
import { TYPES } from '../../types';
import { Product } from '@aquasystem/domain';
import { ProductId, SKU } from '@aquasystem/domain';
import { ProductCategory, UnitOfMeasure } from '@aquasystem/shared-kernel';
import { Money, Quantity } from '@aquasystem/domain';
import { PersonName } from '@aquasystem/domain';
import { EventBusPort } from '../ports/outbound';
import { ProductCreatedEvent, ProductUpdatedEvent } from '@aquasystem/domain';

@injectable()
export class CreateProductUseCase implements UseCase<CreateProductCommand, ProductDto> {
  constructor(
    @inject(TYPES.ProductRepositoryPort) private readonly productRepo: ProductRepositoryPort,
    @inject(TYPES.WarehouseRepositoryPort) private readonly warehouseRepo: WarehouseRepositoryPort,
    @inject(TYPES.EventBusPort) private readonly eventBus: EventBusPort
  ) {}

  async execute(command: CreateProductCommand): Promise<Result<ProductDto>> {
    const skuResult = SKU.create(command.sku);
    if (!skuResult.ok) return Result.fail(skuResult.error);

    const existingProduct = await this.productRepo.findBySku(skuResult.value);
    if (existingProduct) {
      return Result.fail(new Error('Product with this SKU already exists'));
    }

    const nameResult = PersonName.create(command.name);
    if (!nameResult.ok) return Result.fail(nameResult.error);

    const priceResult = Money.create(command.price);
    if (!priceResult.ok) return Result.fail(priceResult.error);

    const costResult = Money.create(command.cost);
    if (!costResult.ok) return Result.fail(costResult.error);

    const minStockResult = Quantity.create(command.minStock);
    if (!minStockResult.ok) return Result.fail(minStockResult.error);

    let maxStockResult = Result.ok<Quantity | null>(null);
    if (command.maxStock) {
      maxStockResult = Quantity.create(command.maxStock);
      if (!maxStockResult.ok) return Result.fail(maxStockResult.error);
    }

    const productResult = Product.create({
      sku: command.sku,
      name: command.name,
      description: command.description,
      category: command.category,
      unit: command.unit,
      price: command.price,
      cost: command.cost,
      minStock: command.minStock,
      maxStock: command.maxStock,
      imageUrl: command.imageUrl,
    });

    if (!productResult.ok) return Result.fail(productResult.error);

    const product = productResult.value;
    await this.productRepo.save(product);

    // Initialize inventory in default warehouse
    const defaultWarehouse = await this.warehouseRepo.findAll({ page: 1, limit: 1 });
    if (defaultWarehouse.data.length > 0) {
      // In production, initialize inventory aggregate
    }

    await this.eventBus.publish(new ProductCreatedEvent(product.id, product.sku, product.name));

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