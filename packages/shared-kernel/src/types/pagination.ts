export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export const Pagination = {
  createMeta(params: PaginationParams, total: number): PaginationMeta {
    const totalPages = Math.ceil(total / params.limit);
    return {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    };
  },

  createResult<T>(data: T[], params: PaginationParams, total: number): PaginatedResult<T> {
    return {
      data,
      meta: this.createMeta(params, total),
    };
  },

  defaultParams(): PaginationParams {
    return { page: 1, limit: 20, sortOrder: 'desc' };
  },

  normalize(params: Partial<PaginationParams>): PaginationParams {
    return {
      page: Math.max(1, params.page || 1),
      limit: Math.min(100, Math.max(1, params.limit || 20)),
      sortBy: params.sortBy,
      sortOrder: params.sortOrder || 'desc',
    };
  },
};