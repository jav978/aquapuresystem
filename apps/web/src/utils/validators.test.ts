import { describe, it, expect } from 'vitest';
import {
  validateRequired,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateEmail,
  validatePassword,
  validatePhone,
  validateTaxId,
  sanitizeFormData,
} from './validators';

describe('Strict Validators Utility', () => {
  it('should reject empty strings, null, undefined and whitespace-only strings', () => {
    expect(validateRequired('', 'Nombre')).toBe('Nombre no puede estar vacío ni contener solo espacios.');
    expect(validateRequired('   ', 'Nombre')).toBe('Nombre no puede estar vacío ni contener solo espacios.');
    expect(validateRequired(null, 'Nombre')).toBe('Nombre es obligatorio.');
    expect(validateRequired(undefined, 'Nombre')).toBe('Nombre es obligatorio.');
    expect(validateRequired('Elena', 'Nombre')).toBeNull();
  });

  it('should validate positive numbers strictly (> 0)', () => {
    expect(validatePositiveNumber(0, 'Precio')).toBe('Precio debe ser mayor a 0.');
    expect(validatePositiveNumber(-5, 'Precio')).toBe('Precio debe ser mayor a 0.');
    expect(validatePositiveNumber('abc', 'Precio')).toBe('Precio debe ser un valor numérico válido.');
    expect(validatePositiveNumber(15.5, 'Precio')).toBeNull();
  });

  it('should validate non-negative numbers (>= 0)', () => {
    expect(validateNonNegativeNumber(0, 'Stock')).toBeNull();
    expect(validateNonNegativeNumber(10, 'Stock')).toBeNull();
    expect(validateNonNegativeNumber(-1, 'Stock')).toBe('Stock no puede ser negativo.');
  });

  it('should validate email format strictly', () => {
    expect(validateEmail('invalid-email')).toBe('Ingrese un formato de correo electrónico válido (ej: usuario@empresa.com).');
    expect(validateEmail('user@')).toBe('Ingrese un formato de correo electrónico válido (ej: usuario@empresa.com).');
    expect(validateEmail('admin@aquapure.com')).toBeNull();
  });

  it('should validate password length', () => {
    expect(validatePassword('123', 6)).toBe('La contraseña debe tener al menos 6 caracteres.');
    expect(validatePassword('securePass123', 6)).toBeNull();
  });

  it('should sanitize form data by trimming all string fields', () => {
    const raw = {
      name: '  Botellón 20L  ',
      sku: '  AQ-20L  ',
      stock: 50,
    };
    const cleaned = sanitizeFormData(raw);
    expect(cleaned.name).toBe('Botellón 20L');
    expect(cleaned.sku).toBe('AQ-20L');
    expect(cleaned.stock).toBe(50);
  });
});
