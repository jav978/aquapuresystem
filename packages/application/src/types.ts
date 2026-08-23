export const TYPES = {
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
  GetLowStockAlertsUseCase: Symbol.for('GetLowStockAlertsUseCase'),

  // Use Cases - Sales
  CreateSaleUseCase: Symbol.for('CreateSaleUseCase'),
  GetSaleUseCase: Symbol.for('GetSaleUseCase'),
  ListSalesUseCase: Symbol.for('ListSalesUseCase'),
  UpdateSaleUseCase: Symbol.for('UpdateSaleUseCase'),

  // Use Cases - Invoicing
  CreateInvoiceUseCase: Symbol.for('CreateInvoiceUseCase'),
  GetInvoiceDetailUseCase: Symbol.for('GetInvoiceDetailUseCase'),
  ListInvoicesUseCase: Symbol.for('ListInvoicesUseCase'),
  AddPaymentUseCase: Symbol.for('AddPaymentUseCase'),
  CreateReturnUseCase: Symbol.for('CreateReturnUseCase'),
  ProcessReturnUseCase: Symbol.for('ProcessReturnUseCase'),
  ListReturnsUseCase: Symbol.for('ListReturnsUseCase'),

  // Use Cases - Users
  InviteUserUseCase: Symbol.for('InviteUserUseCase'),
  UpdateUserRoleUseCase: Symbol.for('UpdateUserRoleUseCase'),
  DeactivateUserUseCase: Symbol.for('DeactivateUserUseCase'),
  ListUsersUseCase: Symbol.for('ListUsersUseCase'),

  // Use Cases - Settings
  GetSettingsUseCase: Symbol.for('GetSettingsUseCase'),
  UpdateSettingUseCase: Symbol.for('UpdateSettingUseCase'),
  GetAuditLogUseCase: Symbol.for('GetAuditLogUseCase'),
} as const;

export type Types = typeof TYPES[keyof typeof TYPES];