import { describe, it, expect } from 'vitest';
import {
  validateRequired,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateEmail,
  validatePassword,
  validatePhone,
  validateTaxId,
  validateOptionalEmail,
  validateOptionalPhone,
  validateDocNumber,
  validatePositiveInteger,
  validateNonNegativeInteger,
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

  it('should validate optional fields correctly', () => {
    expect(validateOptionalEmail('')).toBeNull();
    expect(validateOptionalEmail(null)).toBeNull();
    expect(validateOptionalEmail('invalid')).toBe('Ingrese un formato de correo electrónico válido (ej: usuario@empresa.com).');
    expect(validateOptionalEmail('user@domain.com')).toBeNull();

    expect(validateOptionalPhone('')).toBeNull();
    expect(validateOptionalPhone('123')).toBe('El teléfono debe tener un formato válido (mínimo 7 dígitos).');
    expect(validateOptionalPhone('+58 414 1234567')).toBeNull();
  });

  it('should validate document numbers strictly', () => {
    expect(validateDocNumber('   ', 'Cédula')).toBe('Cédula no puede estar vacío ni contener solo espacios.');
    expect(validateDocNumber('123', 'Cédula')).toBe('Cédula debe tener entre 5 y 20 caracteres.');
    expect(validateDocNumber('18945120', 'Cédula')).toBeNull();
    expect(validateDocNumber('J-31245678-0', 'RIF')).toBeNull();
  });

  it('should validate integers correctly', () => {
    expect(validatePositiveInteger(10.5, 'Cantidad')).toBe('Cantidad debe ser un número entero.');
    expect(validatePositiveInteger(0, 'Cantidad')).toBe('Cantidad debe ser mayor a 1.');
    expect(validatePositiveInteger(5, 'Cantidad')).toBeNull();

    expect(validateNonNegativeInteger(-1, 'Stock')).toBe('Stock no puede ser negativo.');
    expect(validateNonNegativeInteger(10.2, 'Stock')).toBe('Stock debe ser un número entero sin decimales.');
    expect(validateNonNegativeInteger(0, 'Stock')).toBeNull();
  });
});
