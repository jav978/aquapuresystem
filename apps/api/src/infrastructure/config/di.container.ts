import { Container } from 'inversify';
import 'reflect-metadata';
import { TYPES } from '@aquasystem/application';
import { PrismaService } from '@aquasystem/infrastructure';

// Repositories
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { PrismaProductRepository } from '../repositories/prisma-product.repository';
import { PrismaCustomerRepository } from '../repositories/prisma-customer.repository';
import { PrismaWarehouseRepository } from '../repositories/prisma-warehouse.repository';
import { PrismaSaleRepository } from '../repositories/prisma-sale.repository';
import { PrismaInvoiceRepository } from '../repositories/prisma-invoice.repository';
import { PrismaReturnRepository } from '../repositories/prisma-return.repository';
import { PrismaSettingRepository } from '../repositories/prisma-setting.repository';
import { PrismaInventoryMovementRepository } from '../repositories/prisma-inventory-movement.repository';

// Outbound Ports
import { BcryptPasswordHasher } from '../adapters/password-hasher.adapter';
import { JwtTokenGenerator } from '../adapters/jwt-token-generator.adapter';
import { RedisEventBus } from '../adapters/messaging/redis-event-bus.adapter';
import { NodemailerAdapter } from '../adapters/email/nodemailer.adapter';
import { LocalStorageAdapter } from '../adapters/file-storage/local-storage.adapter';

// Domain Services
import { StockValidationService } from '@aquasystem/domain';
import { PricingService } from '@aquasystem/domain';
import { CustomerCreditService } from '@aquasystem/domain';

// Use Cases - Auth
import { LoginUseCase } from '@aquasystem/application';
import { RegisterUseCase } from '@aquasystem/application';
import { ForgotPasswordUseCase } from '@aquasystem/application';
import { VerifyCodeUseCase } from '@aquasystem/application';
import { ResetPasswordUseCase } from '@aquasystem/application';
import { RefreshTokenUseCase } from '@aquasystem/application';

// Use Cases - Inventory
import { CreateProductUseCase } from '@aquasystem/application';
import { GetProductUseCase } from '@aquasystem/application';
import { ListProductsUseCase } from '@aquasystem/application';
import { UpdateProductUseCase } from '@aquasystem/application';
import { DeleteProductUseCase } from '@aquasystem/application';
import { AdjustInventoryUseCase } from '@aquasystem/application';
import { TransferInventoryUseCase } from '@aquasystem/application';
import { GetInventoryMovementsUseCase } from '@aquasystem/application';
import { GetLowStockAlertsUseCase } from '@aquasystem/application';

// Use Cases - Sales
import { CreateSaleUseCase } from '@aquasystem/application';
import { GetSaleUseCase } from '@aquasystem/application';
import { ListSalesUseCase } from '@aquasystem/application';
import { UpdateSaleUseCase } from '@aquasystem/application';

// Use Cases - Invoicing
import { CreateInvoiceUseCase } from '@aquasystem/application';
import { GetInvoiceDetailUseCase } from '@aquasystem/application';
import { ListInvoicesUseCase } from '@aquasystem/application';
import { AddPaymentUseCase } from '@aquasystem/application';
import { CreateReturnUseCase } from '@aquasystem/application';
import { ProcessReturnUseCase } from '@aquasystem/application';
import { ListReturnsUseCase } from '@aquasystem/application';

// Use Cases - Users
import { InviteUserUseCase } from '@aquasystem/application';
import { UpdateUserRoleUseCase } from '@aquasystem/application';
import { DeactivateUserUseCase } from '@aquasystem/application';
import { ListUsersUseCase } from '@aquasystem/application';

// Use Cases - Settings
import { GetSettingsUseCase } from '@aquasystem/application';
import { UpdateSettingUseCase } from '@aquasystem/application';
import { GetAuditLogUseCase } from '@aquasystem/application';

export const container = new Container();

// Core Services
container.bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope();

// Repositories
container.bind(TYPES.UserRepositoryPort).to(PrismaUserRepository).inRequestScope();
container.bind(TYPES.ProductRepositoryPort).to(PrismaProductRepository).inRequestScope();
container.bind(TYPES.CustomerRepositoryPort).to(PrismaCustomerRepository).inRequestScope();
container.bind(TYPES.WarehouseRepositoryPort).to(PrismaWarehouseRepository).inRequestScope();
container.bind(TYPES.SaleRepositoryPort).to(PrismaSaleRepository).inRequestScope();
container.bind(TYPES.InvoiceRepositoryPort).to(PrismaInvoiceRepository).inRequestScope();
container.bind(TYPES.ReturnRepositoryPort).to(PrismaReturnRepository).inRequestScope();
container.bind(TYPES.SettingRepositoryPort).to(PrismaSettingRepository).inRequestScope();
container.bind(TYPES.InventoryMovementRepositoryPort).to(PrismaInventoryMovementRepository).inRequestScope();

// Outbound Ports
container.bind(TYPES.PasswordHasherPort).to(BcryptPasswordHasher).inSingletonScope();
container.bind(TYPES.TokenGeneratorPort).to(JwtTokenGenerator).inSingletonScope();
container.bind(TYPES.EventBusPort).to(RedisEventBus).inSingletonScope();
container.bind(TYPES.EmailPort).to(NodemailerAdapter).inSingletonScope();
container.bind(TYPES.StoragePort).to(LocalStorageAdapter).inSingletonScope();

// Domain Services
container.bind(TYPES.StockValidationService).to(StockValidationService).inSingletonScope();
container.bind(TYPES.PricingService).to(PricingService).inSingletonScope();
container.bind(TYPES.CustomerCreditService).to(CustomerCreditService).inSingletonScope();

// Use Cases - Auth
container.bind(TYPES.LoginUseCase).to(LoginUseCase).inRequestScope();
container.bind(TYPES.RegisterUseCase).to(RegisterUseCase).inRequestScope();
container.bind(TYPES.ForgotPasswordUseCase).to(ForgotPasswordUseCase).inRequestScope();
container.bind(TYPES.VerifyCodeUseCase).to(VerifyCodeUseCase).inRequestScope();
container.bind(TYPES.ResetPasswordUseCase).to(ResetPasswordUseCase).inRequestScope();
container.bind(TYPES.RefreshTokenUseCase).to(RefreshTokenUseCase).inRequestScope();

// Use Cases - Inventory
container.bind(TYPES.CreateProductUseCase).to(CreateProductUseCase).inRequestScope();
container.bind(TYPES.GetProductUseCase).to(GetProductUseCase).inRequestScope();
container.bind(TYPES.ListProductsUseCase).to(ListProductsUseCase).inRequestScope();
container.bind(TYPES.UpdateProductUseCase).to(UpdateProductUseCase).inRequestScope();
container.bind(TYPES.DeleteProductUseCase).to(DeleteProductUseCase).inRequestScope();
container.bind(TYPES.AdjustInventoryUseCase).to(AdjustInventoryUseCase).inRequestScope();
container.bind(TYPES.TransferInventoryUseCase).to(TransferInventoryUseCase).inRequestScope();
container.bind(TYPES.GetInventoryMovementsUseCase).to(GetInventoryMovementsUseCase).inRequestScope();
container.bind(TYPES.GetLowStockAlertsUseCase).to(GetLowStockAlertsUseCase).inRequestScope();

// Use Cases - Sales
container.bind(TYPES.CreateSaleUseCase).to(CreateSaleUseCase).inRequestScope();
container.bind(TYPES.GetSaleUseCase).to(GetSaleUseCase).inRequestScope();
container.bind(TYPES.ListSalesUseCase).to(ListSalesUseCase).inRequestScope();
container.bind(TYPES.UpdateSaleUseCase).to(UpdateSaleUseCase).inRequestScope();

// Use Cases - Invoicing
container.bind(TYPES.CreateInvoiceUseCase).to(CreateInvoiceUseCase).inRequestScope();
container.bind(TYPES.GetInvoiceDetailUseCase).to(GetInvoiceDetailUseCase).inRequestScope();
container.bind(TYPES.ListInvoicesUseCase).to(ListInvoicesUseCase).inRequestScope();
container.bind(TYPES.AddPaymentUseCase).to(AddPaymentUseCase).inRequestScope();
container.bind(TYPES.CreateReturnUseCase).to(CreateReturnUseCase).inRequestScope();
container.bind(TYPES.ProcessReturnUseCase).to(ProcessReturnUseCase).inRequestScope();
container.bind(TYPES.ListReturnsUseCase).to(ListReturnsUseCase).inRequestScope();

// Use Cases - Users
container.bind(TYPES.InviteUserUseCase).to(InviteUserUseCase).inRequestScope();
container.bind(TYPES.UpdateUserRoleUseCase).to(UpdateUserRoleUseCase).inRequestScope();
container.bind(TYPES.DeactivateUserUseCase).to(DeactivateUserUseCase).inRequestScope();
container.bind(TYPES.ListUsersUseCase).to(ListUsersUseCase).inRequestScope();

// Use Cases - Settings
container.bind(TYPES.GetSettingsUseCase).to(GetSettingsUseCase).inRequestScope();
container.bind(TYPES.UpdateSettingUseCase).to(UpdateSettingUseCase).inRequestScope();
container.bind(TYPES.GetAuditLogUseCase).to(GetAuditLogUseCase).inRequestScope();

export { TYPES } from '@aquasystem/application';