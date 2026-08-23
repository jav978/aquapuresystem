import { DomainError } from '@aquasystem/shared-kernel';

export class UserAlreadyExistsError extends DomainError {
  readonly code = 'USER_ALREADY_EXISTS';
  readonly statusCode = 409;
  constructor(email: string) {
    super(`User with email ${email} already exists`, { email });
  }
}

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  readonly statusCode = 404;
  constructor(identifier: string) {
    super(`User not found: ${identifier}`, { identifier });
  }
}

export class InvalidUserRoleError extends DomainError {
  readonly code = 'INVALID_USER_ROLE';
  readonly statusCode = 422;
  constructor(role: string) {
    super(`Invalid user role: ${role}`, { role });
  }
}

export class ProductNotFoundError extends DomainError {
  readonly code = 'PRODUCT_NOT_FOUND';
  readonly statusCode = 404;
  constructor(identifier: string) {
    super(`Product not found: ${identifier}`, { identifier });
  }
}

export class ProductSkuAlreadyExistsError extends DomainError {
  readonly code = 'PRODUCT_SKU_ALREADY_EXISTS';
  readonly statusCode = 409;
  constructor(sku: string) {
    super(`Product with SKU ${sku} already exists`, { sku });
  }
}

export class InsufficientStockError extends DomainError {
  readonly code = 'INSUFFICIENT_STOCK';
  readonly statusCode = 422;
  constructor(productName: string, available: number, requested: number) {
    super(`Insufficient stock for ${productName}. Available: ${available}, Requested: ${requested}`, {
      productName,
      available,
      requested,
    });
  }
}

export class CustomerNotFoundError extends DomainError {
  readonly code = 'CUSTOMER_NOT_FOUND';
  readonly statusCode = 404;
  constructor(identifier: string) {
    super(`Customer not found: ${identifier}`, { identifier });
  }
}

export class CustomerCodeAlreadyExistsError extends DomainError {
  readonly code = 'CUSTOMER_CODE_ALREADY_EXISTS';
  readonly statusCode = 409;
  constructor(code: string) {
    super(`Customer with code ${code} already exists`, { code });
  }
}

export class WarehouseNotFoundError extends DomainError {
  readonly code = 'WAREHOUSE_NOT_FOUND';
  readonly statusCode = 404;
  constructor(identifier: string) {
    super(`Warehouse not found: ${identifier}`, { identifier });
  }
}

export class SaleNotFoundError extends DomainError {
  readonly code = 'SALE_NOT_FOUND';
  readonly statusCode = 404;
  constructor(identifier: string) {
    super(`Sale not found: ${identifier}`, { identifier });
  }
}

export class InvalidSaleStatusTransitionError extends DomainError {
  readonly code = 'INVALID_SALE_STATUS_TRANSITION';
  readonly statusCode = 422;
  constructor(from: string, to: string) {
    super(`Invalid sale status transition from ${from} to ${to}`, { from, to });
  }
}

export class InvoiceNotFoundError extends DomainError {
  readonly code = 'INVOICE_NOT_FOUND';
  readonly statusCode = 404;
  constructor(identifier: string) {
    super(`Invoice not found: ${identifier}`, { identifier });
  }
}

export class InvalidInvoiceStatusTransitionError extends DomainError {
  readonly code = 'INVALID_INVOICE_STATUS_TRANSITION';
  readonly statusCode = 422;
  constructor(from: string, to: string) {
    super(`Invalid invoice status transition from ${from} to ${to}`, { from, to });
  }
}

export class ReturnNotFoundError extends DomainError {
  readonly code = 'RETURN_NOT_FOUND';
  readonly statusCode = 404;
  constructor(identifier: string) {
    super(`Return not found: ${identifier}`, { identifier });
  }
}

export class InvalidReturnStatusTransitionError extends DomainError {
  readonly code = 'INVALID_RETURN_STATUS_TRANSITION';
  readonly statusCode = 422;
  constructor(from: string, to: string) {
    super(`Invalid return status transition from ${from} to ${to}`, { from, to });
  }
}

export class SettingNotFoundError extends DomainError {
  readonly code = 'SETTING_NOT_FOUND';
  readonly statusCode = 404;
  constructor(key: string) {
    super(`Setting not found: ${key}`, { key });
  }
}

export class UnauthorizedAccessError extends DomainError {
  readonly code = 'UNAUTHORIZED_ACCESS';
  readonly statusCode = 403;
  constructor(resource: string, action: string) {
    super(`Unauthorized to ${action} ${resource}`, { resource, action });
  }
}