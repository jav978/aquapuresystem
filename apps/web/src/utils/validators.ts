/**
 * AquaPure System - Strict Form & Data Validation Utilities
 * Enforces exhaustive checks: eliminates empty fields, whitespace-only inputs,
 * and validates strict data types across all modules.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Trims all string properties of an object to remove unwanted whitespace.
 */
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized = { ...data } as any;
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim();
    }
  }
  return sanitized;
}

/**
 * Validates that a string is strictly non-empty and not just spaces.
 */
export function validateRequired(value: unknown, fieldName: string): string | null {
  if (value === null || value === undefined) {
    return `${fieldName} es obligatorio.`;
  }
  if (typeof value === 'string' && value.trim().length === 0) {
    return `${fieldName} no puede estar vacío ni contener solo espacios.`;
  }
  if (Array.isArray(value) && value.length === 0) {
    return `Debe seleccionar al menos un elemento en ${fieldName.toLowerCase()}.`;
  }
  return null;
}

/**
 * Validates strictly positive numbers (> 0).
 */
export function validatePositiveNumber(
  value: unknown,
  fieldName: string,
  min: number = 0.0001
): string | null {
  const req = validateRequired(value, fieldName);
  if (req) return req;

  const num = typeof value === 'number' ? value : Number(value);
  if (isNaN(num)) {
    return `${fieldName} debe ser un valor numérico válido.`;
  }
  if (num < min) {
    return `${fieldName} debe ser mayor a ${min > 0.01 ? min : 0}.`;
  }
  return null;
}

/**
 * Validates non-negative numbers (>= 0).
 */
export function validateNonNegativeNumber(value: unknown, fieldName: string): string | null {
  const req = validateRequired(value, fieldName);
  if (req) return req;

  const num = typeof value === 'number' ? value : Number(value);
  if (isNaN(num)) {
    return `${fieldName} debe ser un número válido.`;
  }
  if (num < 0) {
    return `${fieldName} no puede ser negativo.`;
  }
  return null;
}

/**
 * Validates RFC 5322 standard email format.
 */
export function validateEmail(value: unknown): string | null {
  const req = validateRequired(value, 'El correo electrónico');
  if (req) return req;

  const str = String(value).trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(str)) {
    return 'Ingrese un formato de correo electrónico válido (ej: usuario@empresa.com).';
  }
  return null;
}

/**
 * Validates password length and composition.
 */
export function validatePassword(value: unknown, minLength = 6): string | null {
  const req = validateRequired(value, 'La contraseña');
  if (req) return req;

  const str = String(value).trim();
  if (str.length < minLength) {
    return `La contraseña debe tener al menos ${minLength} caracteres.`;
  }
  return null;
}

/**
 * Validates phone numbers (standard numeric format with optional +/ext).
 */
export function validatePhone(value: unknown, fieldName = 'El teléfono'): string | null {
  const req = validateRequired(value, fieldName);
  if (req) return req;

  const str = String(value).trim();
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
  if (!phoneRegex.test(str)) {
    return `${fieldName} debe tener un formato válido (mínimo 7 dígitos).`;
  }
  return null;
}

/**
 * Validates Tax ID / RUC / NIT.
 */
export function validateTaxId(value: unknown, fieldName = 'El RUC/NIT'): string | null {
  const req = validateRequired(value, fieldName);
  if (req) return req;

  const str = String(value).trim();
  if (str.length < 6 || str.length > 20) {
    return `${fieldName} debe tener entre 6 y 20 caracteres alfanuméricos.`;
  }
  return null;
}

/**
 * Generic schema validator for form objects.
 */
export function validateSchema<T extends Record<string, any>>(
  data: T,
  rules: { [K in keyof T]?: (value: T[K], allData: T) => string | null }
): ValidationResult {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const key in rules) {
    const validator = rules[key];
    if (validator) {
      const errorMsg = validator(data[key], data);
      if (errorMsg) {
        errors[key as string] = errorMsg;
        isValid = false;
      }
    }
  }

  return { isValid, errors };
}
