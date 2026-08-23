import { Product } from '../entities/product';
import { Inventory } from '../aggregates/inventory';
import { Quantity } from '../value-objects/quantity';
import { Money } from '../value-objects/money';
import { Result, DomainError, BusinessRuleError } from '@aquasystem/shared-kernel';

export class StockValidationService {
  static validateAvailability(
    product: Product,
    inventory: Inventory,
    requestedQuantity: Quantity
  ): Result<void, DomainError> {
    const available = inventory.getAvailableQuantity(product.id);
    if (available._value < requestedQuantity._value) {
      return Result.fail(
        new BusinessRuleError(
          `Insufficient stock for product ${product.name}. Available: ${available._value}, Requested: ${requestedQuantity._value}`
        )
      );
    }
    return Result.ok(undefined);
  }

  static validateLowStock(
    product: Product,
    inventory: Inventory
  ): Result<boolean, DomainError> {
    const available = inventory.getAvailableQuantity(product.id);
    const isLow = available._value <= product.minStock._value;
    return Result.ok(isLow);
  }

  static validateOutOfStock(
    product: Product,
    inventory: Inventory
  ): Result<boolean, DomainError> {
    const available = inventory.getAvailableQuantity(product.id);
    const isOut = available.isZero();
    return Result.ok(isOut);
  }

  static calculateReorderQuantity(
    product: Product,
    inventory: Inventory,
    maxStock: Quantity
  ): Result<Quantity, DomainError> {
    const current = inventory.getTotalQuantity(product.id);
    const needed = maxStock._value - current._value;
    if (needed <= 0) {
      return Result.ok(Quantity.zero());
    }
    return Quantity.create(needed);
  }
}

export class PricingService {
  static calculateTotal(
    unitPrice: Money,
    quantity: Quantity,
    discount: Money = Money.zero()
  ): Result<Money, DomainError> {
    const baseTotal = unitPrice.multiply(quantity._value);
    if (!baseTotal.ok) return baseTotal;
    return baseTotal.value.subtract(discount);
  }

  static calculateTax(
    amount: Money,
    taxRate: number
  ): Result<Money, DomainError> {
    return amount.percentage(taxRate);
  }

  static calculateMargin(
    price: Money,
    cost: Money
  ): Result<Money, DomainError> {
    return price.subtract(cost);
  }

  static calculateMarginPercentage(
    price: Money,
    cost: Money
  ): Result<number, DomainError> {
    if (price._value === 0) {
      return Result.ok(0);
    }
    const margin = price._value - cost._value;
    return Result.ok((margin / price._value) * 100);
  }

  static applyVolumeDiscount(
    unitPrice: Money,
    quantity: Quantity,
    tiers: Array<{ minQty: number; discountPercent: number }>
  ): Result<Money, DomainError> {
    const applicableTier = tiers
      .filter((t) => quantity._value >= t.minQty)
      .sort((a, b) => b.minQty - a.minQty)[0];

    if (!applicableTier) {
      return Result.ok(unitPrice);
    }

    return unitPrice.percentage(100 - applicableTier.discountPercent);
  }
}

export class CustomerCreditService {
  static validateCreditLimit(
    creditLimit: Money,
    usedCredit: Money,
    newAmount: Money
  ): Result<void, DomainError> {
    const available = creditLimit.subtract(usedCredit);
    if (!available.ok) return available;

    if (newAmount._value > available.value._value) {
      return Result.fail(
        new BusinessRuleError(
          `Credit limit exceeded. Available: ${available.value}, Requested: ${newAmount}`
        )
      );
    }
    return Result.ok(undefined);
  }

  static calculateUsedCredit(invoices: Array<{ pendingAmount: Money }>): Money {
    return invoices.reduce(
      (sum, inv) => sum.add(inv.pendingAmount),
      Money.zero()
    );
  }
}