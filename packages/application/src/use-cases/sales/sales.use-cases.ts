import { inject, injectable } from 'inversify';
import { Result, PaginatedResult } from '@aquasystem/shared-kernel';
import { SaleRepositoryPort, CustomerRepositoryPort, ProductRepositoryPort, UserRepositoryPort } from '@aquasystem/domain';
import { CreateSaleCommand, SaleDto, SaleQuery, UpdateSaleCommand } from '../../dto/sales.dto';
import { UseCase } from '../ports/inbound/use-case.port';
import { TYPES } from '../../types';
import { Sale, SaleId, CustomerId, UserId, ProductId } from '@aquasystem/domain';
import { Quantity, Money } from '@aquasystem/domain';
import { SaleStatus } from '@aquasystem/shared-kernel';
import { EventBusPort } from '../ports/outbound';
import { SaleCreatedEvent, SaleConfirmedEvent } from '@aquasystem/domain';

@injectable()
export class CreateSaleUseCase implements UseCase<CreateSaleCommand, SaleDto> {
  constructor(
    @inject(TYPES.SaleRepositoryPort) private readonly saleRepo: SaleRepositoryPort,
    @inject(TYPES.CustomerRepositoryPort) private readonly customerRepo: CustomerRepositoryPort,
    @inject(TYPES.ProductRepositoryPort) private readonly productRepo: ProductRepositoryPort,
    @inject(TYPES.UserRepositoryPort) private readonly userRepo: UserRepositoryPort,
    @inject(TYPES.EventBusPort) private readonly eventBus: EventBusPort
  ) {}

  async execute(command: CreateSaleCommand): Promise<Result<SaleDto>> {
    const customerId = CustomerId.create(command.customerId);
    const userId = UserId.create(command.userId);

    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      return Result.fail(new Error('Customer not found'));
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      return Result.fail(new Error('User not found'));
    }

    // Validate products exist and get current prices
    const items: any[] = [];
    for (const item of command.items) {
      const productId = ProductId.create(item.productId);
      const product = await this.productRepo.findById(productId);
      if (!product) {
        return Result.fail(new Error(`Product ${item.productId} not found`));
      }

      const quantity = Quantity.create(item.quantity);
      if (!quantity.ok) return Result.fail(quantity.error);

      const unitPrice = Money.create(item.unitPrice);
      if (!unitPrice.ok) return Result.fail(unitPrice.error);

      const discount = Money.create(item.discount);
      if (!discount.ok) return Result.fail(discount.error);

      items.push({
        productId,
        productName: product.name,
        quantity: quantity.value,
        unitPrice: unitPrice.value,
        discount: discount.value,
      });
    }

    const saleResult = Sale.create({
      customerId,
      userId,
      items,
      taxRate: command.taxRate,
      discount: Money.create(command.discount).unwrap(),
      notes: command.notes,
    });

    if (!saleResult.ok) return Result.fail(saleResult.error);

    const sale = saleResult.value;
    await this.saleRepo.save(sale);
    await this.eventBus.publish(new SaleCreatedEvent(sale.id, sale.saleNumber, sale.customerId));

    return Result.ok(this.toDto(sale, customer, user));
  }

  private toDto(sale: any, customer: any, user: any): SaleDto {
    return {
      id: sale.id.value,
      saleNumber: sale.saleNumber,
      customerId: sale.customerId.value,
      customerName: customer.name,
      userId: sale.userId.value,
      userName: user.fullName,
      status: sale.status,
      items: sale.items.map((item: any) => ({
        id: item.id,
        productId: item.productId.value,
        productName: item.productName,
        quantity: item.quantity._value,
        unitPrice: item.unitPrice._value,
        discount: item.discount._value,
        total: item.total._value,
      })),
      subtotal: sale.subtotal._value,
      taxAmount: sale.taxAmount._value,
      discount: sale.discount._value,
      total: sale.total._value,
      notes: sale.notes,
      saleDate: sale.saleDate,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };
  }
}

@injectable()
export class ListSalesUseCase implements UseCase<SaleQuery, PaginatedResult<SaleDto>> {
  constructor(
    @inject(TYPES.SaleRepositoryPort) private readonly saleRepo: SaleRepositoryPort
  ) {}

  async execute(query: SaleQuery): Promise<Result<PaginatedResult<SaleDto>>> {
    const result = await this.saleRepo.findAll(query, {
      customerId: query.customerId ? import('@aquasystem/domain').then(m => m.CustomerId.create(query.customerId!)).then(r => r.value) : undefined,
      userId: query.userId ? import('@aquasystem/domain').then(m => m.UserId.create(query.userId!)).then(r => r.value) : undefined,
      status: query.status,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      search: query.search,
    });

    // In production, would need to join customer and user names
    return Result.ok({
      data: result.data.map((sale: any) => ({
        id: sale.id.value,
        saleNumber: sale.saleNumber,
        customerId: sale.customerId.value,
        customerName: 'Customer Name',
        userId: sale.userId.value,
        userName: 'User Name',
        status: sale.status,
        items: sale.items.map((item: any) => ({
          id: item.id,
          productId: item.productId.value,
          productName: item.productName,
          quantity: item.quantity._value,
          unitPrice: item.unitPrice._value,
          discount: item.discount._value,
          total: item.total._value,
        })),
        subtotal: sale.subtotal._value,
        taxAmount: sale.taxAmount._value,
        discount: sale.discount._value,
        total: sale.total._value,
        notes: sale.notes,
        saleDate: sale.saleDate,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
      })),
      meta: result.meta,
    });
  }
}

@injectable()
export class GetSaleUseCase implements UseCase<string, SaleDto> {
  constructor(
    @inject(TYPES.SaleRepositoryPort) private readonly saleRepo: SaleRepositoryPort
  ) {}

  async execute(id: string): Promise<Result<SaleDto>> {
    const saleId = SaleId.create(id);
    const sale = await this.saleRepo.findById(saleId);
    if (!sale) {
      return Result.fail(new Error('Sale not found'));
    }

    // In production, would join customer and user
    return Result.ok({
      id: sale.id.value,
      saleNumber: sale.saleNumber,
      customerId: sale.customerId.value,
      customerName: 'Customer Name',
      userId: sale.userId.value,
      userName: 'User Name',
      status: sale.status,
      items: sale.items.map((item: any) => ({
        id: item.id,
        productId: item.productId.value,
        productName: item.productName,
        quantity: item.quantity._value,
        unitPrice: item.unitPrice._value,
        discount: item.discount._value,
        total: item.total._value,
      })),
      subtotal: sale.subtotal._value,
      taxAmount: sale.taxAmount._value,
      discount: sale.discount._value,
      total: sale.total._value,
      notes: sale.notes,
      saleDate: sale.saleDate,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    });
  }
}

@injectable()
export class UpdateSaleUseCase implements UseCase<UpdateSaleCommand, SaleDto> {
  constructor(
    @inject(TYPES.SaleRepositoryPort) private readonly saleRepo: SaleRepositoryPort,
    @inject(TYPES.ProductRepositoryPort) private readonly productRepo: ProductRepositoryPort,
    @inject(TYPES.EventBusPort) private readonly eventBus: EventBusPort
  ) {}

  async execute(command: UpdateSaleCommand): Promise<Result<SaleDto>> {
    const saleId = SaleId.create(command.id);
    const sale = await this.saleRepo.findById(saleId);
    if (!sale) {
      return Result.fail(new Error('Sale not found'));
    }

    if (sale.status !== SaleStatus.PENDING) {
      return Result.fail(new Error('Only pending sales can be modified'));
    }

    if (command.items) {
      // Remove all existing items and add new ones
      // This is simplified - in production, would do granular updates
      for (const item of command.items) {
        // Implementation would go here
      }
    }

    await this.saleRepo.save(sale);
    return Result.ok(this.toDto(sale, null, null));
  }

  private toDto(sale: any, customer: any, user: any): SaleDto {
    return {
      id: sale.id.value,
      saleNumber: sale.saleNumber,
      customerId: sale.customerId.value,
      customerName: customer?.name || 'Customer Name',
      userId: sale.userId.value,
      userName: user?.fullName || 'User Name',
      status: sale.status,
      items: sale.items.map((item: any) => ({
        id: item.id,
        productId: item.productId.value,
        productName: item.productName,
        quantity: item.quantity._value,
        unitPrice: item.unitPrice._value,
        discount: item.discount._value,
        total: item.total._value,
      })),
      subtotal: sale.subtotal._value,
      taxAmount: sale.taxAmount._value,
      discount: sale.discount._value,
      total: sale.total._value,
      notes: sale.notes,
      saleDate: sale.saleDate,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };
  }
}