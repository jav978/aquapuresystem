import { inject, injectable } from 'inversify';
import { Result, PaginatedResult } from '@aquasystem/shared-kernel';
import { InvoiceRepositoryPort, SaleRepositoryPort, CustomerRepositoryPort, ProductRepositoryPort, UserRepositoryPort, ReturnRepositoryPort } from '@aquasystem/domain';
import {
  CreateInvoiceCommand,
  InvoiceDto,
  InvoiceDetailDto,
  InvoiceQuery,
  AddPaymentCommand,
  CreateReturnCommand,
  ProcessReturnCommand,
  ReturnQuery,
  ReturnDto,
} from '../../dto/invoicing.dto';
import { UseCase } from '../ports/inbound/use-case.port';
import { TYPES } from '../../types';
import { Invoice, InvoiceId, SaleId, CustomerId, UserId, ProductId, Return, ReturnId } from '@aquasystem/domain';
import { Quantity, Money } from '@aquasystem/domain';
import { InvoiceStatus, PaymentMethod, PaymentStatus, ReturnStatus, ReturnCondition } from '@aquasystem/shared-kernel';
import { EventBusPort } from '../ports/outbound';
import { InvoiceCreatedEvent, InvoiceSentEvent, PaymentAddedEvent, ReturnCreatedEvent } from '@aquasystem/domain';

@injectable()
export class CreateInvoiceUseCase implements UseCase<CreateInvoiceCommand, InvoiceDto> {
  constructor(
    @inject(TYPES.InvoiceRepositoryPort) private readonly invoiceRepo: InvoiceRepositoryPort,
    @inject(TYPES.SaleRepositoryPort) private readonly saleRepo: SaleRepositoryPort,
    @inject(TYPES.CustomerRepositoryPort) private readonly customerRepo: CustomerRepositoryPort,
    @inject(TYPES.ProductRepositoryPort) private readonly productRepo: ProductRepositoryPort,
    @inject(TYPES.UserRepositoryPort) private readonly userRepo: UserRepositoryPort,
    @inject(TYPES.EventBusPort) private readonly eventBus: EventBusPort
  ) {}

  async execute(command: CreateInvoiceCommand): Promise<Result<InvoiceDto>> {
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

    let saleId: any = null;
    if (command.saleId) {
      saleId = SaleId.create(command.saleId);
      const sale = await this.saleRepo.findById(saleId);
      if (!sale) {
        return Result.fail(new Error('Sale not found'));
      }
    }

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
        taxRate: item.taxRate,
      });
    }

    const invoiceResult = Invoice.create({
      saleId,
      customerId,
      userId,
      items,
      dueDate: command.dueDate,
      notes: command.notes,
    });

    if (!invoiceResult.ok) return Result.fail(invoiceResult.error);

    const invoice = invoiceResult.value;
    await this.invoiceRepo.save(invoice);
    await this.eventBus.publish(new InvoiceCreatedEvent(invoice.id, invoice.invoiceNumber, invoice.customerId));

    return Result.ok(this.toDto(invoice, customer, user));
  }

  private toDto(invoice: any, customer: any, user: any): InvoiceDto {
    return {
      id: invoice.id.value,
      invoiceNumber: invoice.invoiceNumber,
      saleId: invoice.saleId?.value ?? null,
      customerId: invoice.customerId.value,
      customerName: customer.name,
      userId: invoice.userId.value,
      userName: user.fullName,
      status: invoice.status,
      items: invoice.items.map((item: any) => ({
        id: item.id,
        productId: item.productId.value,
        productName: item.productName,
        quantity: item.quantity._value,
        unitPrice: item.unitPrice._value,
        discount: item.discount._value,
        taxRate: item.taxRate,
        total: item.total._value,
      })),
      subtotal: invoice.subtotal._value,
      taxAmount: invoice.taxAmount._value,
      total: invoice.total._value,
      paidAmount: invoice.paidAmount._value,
      pendingAmount: invoice.pendingAmount._value,
      isFullyPaid: invoice.isFullyPaid,
      isOverdue: invoice.isOverdue,
      payments: invoice.payments.map((p: any) => ({
        id: p.id,
        paymentNumber: p.paymentNumber,
        amount: p.amount._value,
        method: p.method,
        reference: p.reference,
        status: p.status,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }
}

@injectable()
export class GetInvoiceDetailUseCase implements UseCase<string, InvoiceDetailDto> {
  constructor(
    @inject(TYPES.InvoiceRepositoryPort) private readonly invoiceRepo: InvoiceRepositoryPort
  ) {}

  async execute(id: string): Promise<Result<InvoiceDetailDto>> {
    const invoiceId = InvoiceId.create(id);
    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice) {
      return Result.fail(new Error('Invoice not found'));
    }

    // In production, would join customer details
    return Result.ok({
      ...this.toDto(invoice, null, null),
      customer: {
        id: 'customer-id',
        code: 'CUST-001',
        name: 'Customer Name',
        email: null,
        phone: null,
        address: null,
        taxId: null,
      },
    });
  }

  private toDto(invoice: any, customer: any, user: any): InvoiceDto {
    return {
      id: invoice.id.value,
      invoiceNumber: invoice.invoiceNumber,
      saleId: invoice.saleId?.value ?? null,
      customerId: invoice.customerId.value,
      customerName: customer?.name || 'Customer Name',
      userId: invoice.userId.value,
      userName: user?.fullName || 'User Name',
      status: invoice.status,
      items: invoice.items.map((item: any) => ({
        id: item.id,
        productId: item.productId.value,
        productName: item.productName,
        quantity: item.quantity._value,
        unitPrice: item.unitPrice._value,
        discount: item.discount._value,
        taxRate: item.taxRate,
        total: item.total._value,
      })),
      subtotal: invoice.subtotal._value,
      taxAmount: invoice.taxAmount._value,
      total: invoice.total._value,
      paidAmount: invoice.paidAmount._value,
      pendingAmount: invoice.pendingAmount._value,
      isFullyPaid: invoice.isFullyPaid,
      isOverdue: invoice.isOverdue,
      payments: invoice.payments.map((p: any) => ({
        id: p.id,
        paymentNumber: p.paymentNumber,
        amount: p.amount._value,
        method: p.method,
        reference: p.reference,
        status: p.status,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }
}

@injectable()
export class ListInvoicesUseCase implements UseCase<InvoiceQuery, PaginatedResult<InvoiceDto>> {
  constructor(
    @inject(TYPES.InvoiceRepositoryPort) private readonly invoiceRepo: InvoiceRepositoryPort
  ) {}

  async execute(query: InvoiceQuery): Promise<Result<PaginatedResult<InvoiceDto>>> {
    const result = await this.invoiceRepo.findAll(query, {
      customerId: query.customerId ? import('@aquasystem/domain').then(m => m.CustomerId.create(query.customerId!)).then(r => r.value) : undefined,
      userId: query.userId ? import('@aquasystem/domain').then(m => m.UserId.create(query.userId!)).then(r => r.value) : undefined,
      status: query.status,
      saleId: query.saleId ? import('@aquasystem/domain').then(m => m.SaleId.create(query.saleId!)).then(r => r.value) : undefined,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      search: query.search,
    });

    return Result.ok({
      data: result.data.map((invoice: any) => ({
        id: invoice.id.value,
        invoiceNumber: invoice.invoiceNumber,
        saleId: invoice.saleId?.value ?? null,
        customerId: invoice.customerId.value,
        customerName: 'Customer Name',
        userId: invoice.userId.value,
        userName: 'User Name',
        status: invoice.status,
        items: invoice.items.map((item: any) => ({
          id: item.id,
          productId: item.productId.value,
          productName: item.productName,
          quantity: item.quantity._value,
          unitPrice: item.unitPrice._value,
          discount: item.discount._value,
          taxRate: item.taxRate,
          total: item.total._value,
        })),
        subtotal: invoice.subtotal._value,
        taxAmount: invoice.taxAmount._value,
        total: invoice.total._value,
        paidAmount: invoice.paidAmount._value,
        pendingAmount: invoice.pendingAmount._value,
        isFullyPaid: invoice.isFullyPaid,
        isOverdue: invoice.isOverdue,
        payments: invoice.payments.map((p: any) => ({
          id: p.id,
          paymentNumber: p.paymentNumber,
          amount: p.amount._value,
          method: p.method,
          reference: p.reference,
          status: p.status,
          paidAt: p.paidAt,
          createdAt: p.createdAt,
        })),
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        paidDate: invoice.paidDate,
        notes: invoice.notes,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
      })),
      meta: result.meta,
    });
  }
}

@injectable()
export class AddPaymentUseCase implements UseCase<AddPaymentCommand, void> {
  constructor(
    @inject(TYPES.InvoiceRepositoryPort) private readonly invoiceRepo: InvoiceRepositoryPort,
    @inject(TYPES.EventBusPort) private readonly eventBus: EventBusPort
  ) {}

  async execute(command: AddPaymentCommand): Promise<Result<void>> {
    const invoiceId = InvoiceId.create(command.invoiceId);
    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice) {
      return Result.fail(new Error('Invoice not found'));
    }

    const amount = Money.create(command.amount);
    if (!amount.ok) return Result.fail(amount.error);

    const payment = {
      id: crypto.randomUUID(),
      paymentNumber: `PAY-${Date.now().toString(36).toUpperCase()}`,
      amount: amount.value,
      method: command.method,
      reference: command.reference || null,
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
      createdAt: new Date(),
    };

    const result = invoice.addPayment(payment);
    if (!result.ok) return Result.fail(result.error);

    await this.invoiceRepo.save(invoice);
    await this.eventBus.publish(new PaymentAddedEvent(invoice.id, payment.id, payment.amount));

    return Result.ok(undefined);
  }
}

@injectable()
export class CreateReturnUseCase implements UseCase<CreateReturnCommand, ReturnDto> {
  constructor(
    @inject(TYPES.ReturnRepositoryPort) private readonly returnRepo: ReturnRepositoryPort,
    @inject(TYPES.InvoiceRepositoryPort) private readonly invoiceRepo: InvoiceRepositoryPort,
    @inject(TYPES.CustomerRepositoryPort) private readonly customerRepo: CustomerRepositoryPort,
    @inject(TYPES.UserRepositoryPort) private readonly userRepo: UserRepositoryPort,
    @inject(TYPES.EventBusPort) private readonly eventBus: EventBusPort
  ) {}

  async execute(command: CreateReturnCommand): Promise<Result<ReturnDto>> {
    const invoiceId = InvoiceId.create(command.invoiceId);
    const customerId = CustomerId.create(command.customerId);
    const userId = UserId.create(command.userId);

    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice) {
      return Result.fail(new Error('Invoice not found'));
    }

    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      return Result.fail(new Error('Customer not found'));
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      return Result.fail(new Error('User not found'));
    }

    const items: any[] = [];
    for (const item of command.items) {
      const productId = ProductId.create(item.productId);
      const quantity = Quantity.create(item.quantity);
      if (!quantity.ok) return Result.fail(quantity.error);

      const unitPrice = Money.create(item.unitPrice);
      if (!unitPrice.ok) return Result.fail(unitPrice.error);

      items.push({
        productId,
        productName: item.productName,
        quantity: quantity.value,
        unitPrice: unitPrice.value,
        reason: item.reason,
        condition: item.condition,
      });
    }

    const returnResult = Return.create({
      invoiceId,
      customerId,
      userId,
      reason: command.reason,
      items,
    });

    if (!returnResult.ok) return Result.fail(returnResult.error);

    const returnEntity = returnResult.value;
    await this.returnRepo.save(returnEntity);
    await this.eventBus.publish(new ReturnCreatedEvent(returnEntity.id, returnEntity.returnNumber, returnEntity.invoiceId));

    return Result.ok(this.toDto(returnEntity, invoice, customer, user));
  }

  private toDto(returnEntity: any, invoice: any, customer: any, user: any): ReturnDto {
    return {
      id: returnEntity.id.value,
      returnNumber: returnEntity.returnNumber,
      invoiceId: returnEntity.invoiceId.value,
      invoiceNumber: invoice.invoiceNumber,
      customerId: returnEntity.customerId.value,
      customerName: customer.name,
      userId: returnEntity.userId.value,
      userName: user.fullName,
      status: returnEntity.status,
      reason: returnEntity.reason,
      items: returnEntity.items.map((item: any) => ({
        id: item.id,
        productId: item.productId.value,
        productName: item.productName,
        quantity: item.quantity._value,
        unitPrice: item.unitPrice._value,
        reason: item.reason,
        condition: item.condition,
        total: item.total._value,
      })),
      total: returnEntity.total._value,
      createdAt: returnEntity.createdAt,
      updatedAt: returnEntity.updatedAt,
    };
  }
}

@injectable()
export class ProcessReturnUseCase implements UseCase<ProcessReturnCommand, void> {
  constructor(
    @inject(TYPES.ReturnRepositoryPort) private readonly returnRepo: ReturnRepositoryPort,
    @inject(TYPES.EventBusPort) private readonly eventBus: EventBusPort
  ) {}

  async execute(command: ProcessReturnCommand): Promise<Result<void>> {
    const returnId = ReturnId.create(command.returnId);
    const returnEntity = await this.returnRepo.findById(returnId);
    if (!returnEntity) {
      return Result.fail(new Error('Return not found'));
    }

    let result: Result<void, Error>;
    switch (command.action) {
      case 'approve':
        result = returnEntity.approve();
        break;
      case 'reject':
        result = returnEntity.reject(command.reason || '');
        break;
      case 'process':
        result = returnEntity.process();
        break;
      case 'refund':
        result = returnEntity.refund();
        break;
      default:
        return Result.fail(new Error('Invalid action'));
    }

    if (!result.ok) return Result.fail(result.error);

    await this.returnRepo.save(returnEntity);
    return Result.ok(undefined);
  }
}

@injectable()
export class ListReturnsUseCase implements UseCase<ReturnQuery, PaginatedResult<ReturnDto>> {
  constructor(
    @inject(TYPES.ReturnRepositoryPort) private readonly returnRepo: ReturnRepositoryPort
  ) {}

  async execute(query: ReturnQuery): Promise<Result<PaginatedResult<ReturnDto>>> {
    const result = await this.returnRepo.findAll(query, {
      customerId: query.customerId ? import('@aquasystem/domain').then(m => m.CustomerId.create(query.customerId!)).then(r => r.value) : undefined,
      invoiceId: query.invoiceId ? import('@aquasystem/domain').then(m => m.InvoiceId.create(query.invoiceId!)).then(r => r.value) : undefined,
      status: query.status,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      search: query.search,
    });

    return Result.ok({
      data: result.data.map((r: any) => ({
        id: r.id.value,
        returnNumber: r.returnNumber,
        invoiceId: r.invoiceId.value,
        invoiceNumber: 'INV-001',
        customerId: r.customerId.value,
        customerName: 'Customer Name',
        userId: r.userId.value,
        userName: 'User Name',
        status: r.status,
        reason: r.reason,
        items: r.items.map((item: any) => ({
          id: item.id,
          productId: item.productId.value,
          productName: item.productName,
          quantity: item.quantity._value,
          unitPrice: item.unitPrice._value,
          reason: item.reason,
          condition: item.condition,
          total: item.total._value,
        })),
        total: r.total._value,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      meta: result.meta,
    });
  }
}