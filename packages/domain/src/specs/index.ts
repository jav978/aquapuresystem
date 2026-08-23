import { Result } from '@aquasystem/shared-kernel';

export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

export abstract class BaseSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

class AndSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

class OrSpecification<T> extends BaseSpecification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private readonly spec: Specification<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}

export class TrueSpecification<T> extends BaseSpecification<T> {
  isSatisfiedBy(): boolean {
    return true;
  }
}

export class FalseSpecification<T> extends BaseSpecification<T> {
  isSatisfiedBy(): boolean {
    return false;
  }
}

export function createSpecification<T>(
  predicate: (candidate: T) => boolean
): Specification<T> {
  return new (class extends BaseSpecification<T> {
    isSatisfiedBy(candidate: T): boolean {
      return predicate(candidate);
    }
  })();
}

export interface FilterCriteria<T> {
  field: keyof T;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'between';
  value: any;
}

export class FilterSpecification<T> extends BaseSpecification<T> {
  constructor(private readonly criteria: FilterCriteria<T>[]) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.criteria.every((c) => this.evaluate(candidate, c));
  }

  private evaluate(candidate: T, criteria: FilterCriteria<T>): boolean {
    const value = candidate[criteria.field];
    switch (criteria.operator) {
      case 'eq':
        return value === criteria.value;
      case 'neq':
        return value !== criteria.value;
      case 'gt':
        return value > criteria.value;
      case 'gte':
        return value >= criteria.value;
      case 'lt':
        return value < criteria.value;
      case 'lte':
        return value <= criteria.value;
      case 'contains':
        return String(value).includes(String(criteria.value));
      case 'startsWith':
        return String(value).startsWith(String(criteria.value));
      case 'endsWith':
        return String(value).endsWith(String(criteria.value));
      case 'in':
        return Array.isArray(criteria.value) && criteria.value.includes(value);
      case 'between':
        return Array.isArray(criteria.value) &&
          criteria.value.length === 2 &&
          value >= criteria.value[0] &&
          value <= criteria.value[1];
      default:
        return true;
    }
  }
}

export interface SortCriteria<T> {
  field: keyof T;
  order: 'asc' | 'desc';
}

export function applySort<T>(items: T[], sort: SortCriteria<T>): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[sort.field];
    const bVal = b[sort.field];
    if (aVal < bVal) return sort.order === 'asc' ? -1 : 1;
    if (aVal > bVal) return sort.order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function applyPagination<T>(
  items: T[],
  page: number,
  limit: number
): { data: T[]; total: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total,
    totalPages,
  };
}