export const TYPES = {
  // Core
  PrismaService: Symbol.for('PrismaService'),

  // Repositories
  UserRepositoryPort: Symbol.for('UserRepositoryPort'),
  ProductRepositoryPort: Symbol.for('ProductRepositoryPort'),
  CustomerRepositoryPort: Symbol.for('CustomerRepositoryPort'),
  WarehouseRepositoryPort: Symbol.for('WarehouseRepositoryPort'),
  SaleRepositoryPort: Symbol.for('SaleRepositoryPort'),
  InvoiceRepositoryPort: Symbol.for('InvoiceRepositoryPort'),
  ReturnRepositoryPort: Symbol.for('ReturnRepositoryPort'),
  SettingRepositoryPort: Symbol.for('SettingRepositoryPort'),
  InventoryMovementRepositoryPort: Symbol.for('InventoryMovementRepositoryPort'),

  // Outbound Ports
  PasswordHasherPort: Symbol.for('PasswordHasherPort'),
  TokenGeneratorPort: Symbol.for('TokenGeneratorPort'),
  EventBusPort: Symbol.for('EventBusPort'),
  EmailPort: Symbol.for('EmailPort'),
  StoragePort: Symbol.for('StoragePort'),
  NotificationPort: Symbol.for('NotificationPort'),

  // Domain Services
  StockValidationService: Symbol.for('StockValidationService'),
  PricingService: Symbol.for('PricingService'),
  CustomerCreditService: Symbol.for('CustomerCreditService'),

  // Use Cases - Auth
  LoginUseCase: Symbol.for('LoginUseCase'),
  RegisterUseCase: Symbol.for('RegisterUseCase'),
  ForgotPasswordUseCase: Symbol.for('ForgotPasswordUseCase'),
  VerifyCodeUseCase: Symbol.for('VerifyCodeUseCase'),
  ResetPasswordUseCase: Symbol.for('ResetPasswordUseCase'),
  RefreshTokenUseCase: Symbol.for('RefreshTokenUseCase'),

  // Use Cases - Inventory
  CreateProductUseCase: Symbol.for('CreateProductUseCase'),
  GetProductUseCase: Symbol.for('GetProductUseCase'),
  ListProductsUseCase: Symbol.for('ListProductsUseCase'),
  UpdateProductUseCase: Symbol.for('UpdateProductUseCase'),
  DeleteProductUseCase: Symbol.for('DeleteProductUseCase'),
  AdjustInventoryUseCase: Symbol.for('AdjustInventoryUseCase'),
  TransferInventoryUseCase: Symbol.for('TransferInventoryUseCase'),
  GetInventoryMovementsUseCase: Symbol.for('GetInventoryMovementsUseCase'),
  GetInventoryMovementUseCase: Symbol.for('GetInventoryMovementUseCase'),
  CreateInventoryMovementUseCase: Symbol.for('CreateInventoryMovementUseCase'),
  UpdateInventoryMovementUseCase: Symbol.for('UpdateInventoryMovementUseCase'),
  DeleteInventoryMovementUseCase: Symbol.for('DeleteInventoryMovementUseCase'),
  GetLowStockAlertsUseCase: Symbol.for('GetLowStockAlertsUseCase'),

  // Use Cases - Customers
  GetCustomerUseCase: Symbol.for('GetCustomerUseCase'),
  ListCustomersUseCase: Symbol.for('ListCustomersUseCase'),
  CreateCustomerUseCase: Symbol.for('CreateCustomerUseCase'),
  UpdateCustomerUseCase: Symbol.for('UpdateCustomerUseCase'),
  DeleteCustomerUseCase: Symbol.for('DeleteCustomerUseCase'),

  // Use Cases - Warehouses
  GetWarehouseUseCase: Symbol.for('GetWarehouseUseCase'),
  ListWarehousesUseCase: Symbol.for('ListWarehousesUseCase'),
  CreateWarehouseUseCase: Symbol.for('CreateWarehouseUseCase'),
  UpdateWarehouseUseCase: Symbol.for('UpdateWarehouseUseCase'),
  DeleteWarehouseUseCase: Symbol.for('DeleteWarehouseUseCase'),

  // Use Cases - Sales
  CreateSaleUseCase: Symbol.for('CreateSaleUseCase'),
  GetSaleUseCase: Symbol.for('GetSaleUseCase'),
  ListSalesUseCase: Symbol.for('ListSalesUseCase'),
  UpdateSaleUseCase: Symbol.for('UpdateSaleUseCase'),

  // Use Cases - Invoicing & Payments & Returns
  CreateInvoiceUseCase: Symbol.for('CreateInvoiceUseCase'),
  GetInvoiceDetailUseCase: Symbol.for('GetInvoiceDetailUseCase'),
  ListInvoicesUseCase: Symbol.for('ListInvoicesUseCase'),
  AddPaymentUseCase: Symbol.for('AddPaymentUseCase'),
  GetPaymentUseCase: Symbol.for('GetPaymentUseCase'),
  ListPaymentsUseCase: Symbol.for('ListPaymentsUseCase'),
  UpdatePaymentUseCase: Symbol.for('UpdatePaymentUseCase'),
  DeletePaymentUseCase: Symbol.for('DeletePaymentUseCase'),
  CreateReturnUseCase: Symbol.for('CreateReturnUseCase'),
  GetReturnUseCase: Symbol.for('GetReturnUseCase'),
  ProcessReturnUseCase: Symbol.for('ProcessReturnUseCase'),
  ListReturnsUseCase: Symbol.for('ListReturnsUseCase'),
  DeleteReturnUseCase: Symbol.for('DeleteReturnUseCase'),

  // Use Cases - Users
  GetUserUseCase: Symbol.for('GetUserUseCase'),
  CreateUserUseCase: Symbol.for('CreateUserUseCase'),
  UpdateUserUseCase: Symbol.for('UpdateUserUseCase'),
  DeleteUserUseCase: Symbol.for('DeleteUserUseCase'),
  InviteUserUseCase: Symbol.for('InviteUserUseCase'),
  UpdateUserRoleUseCase: Symbol.for('UpdateUserRoleUseCase'),
  DeactivateUserUseCase: Symbol.for('DeactivateUserUseCase'),
  ListUsersUseCase: Symbol.for('ListUsersUseCase'),

  // Use Cases - Settings
  GetSettingsUseCase: Symbol.for('GetSettingsUseCase'),
  ListSettingsUseCase: Symbol.for('ListSettingsUseCase'),
  UpdateSettingUseCase: Symbol.for('UpdateSettingUseCase'),
  DeleteSettingUseCase: Symbol.for('DeleteSettingUseCase'),
  GetAuditLogUseCase: Symbol.for('GetAuditLogUseCase'),
} as const;

export type Types = typeof TYPES[keyof typeof TYPES];