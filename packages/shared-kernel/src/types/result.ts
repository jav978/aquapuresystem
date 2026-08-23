export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ ok: true, value }),
  fail: <E>(error: E): Result<never, E> => ({ ok: false, error }),

  isOk: <T, E>(result: Result<T, E>): result is { ok: true; value: T } => result.ok,
  isFail: <T, E>(result: Result<T, E>): result is { ok: false; error: E } => !result.ok,

  map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> =>
    result.ok ? Result.ok(fn(result.value)) : Result.fail(result.error),

  mapErr: <T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> =>
    result.ok ? Result.ok(result.value) : Result.fail(fn(result.error)),

  flatMap: <T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> =>
    result.ok ? fn(result.value) : Result.fail(result.error),

  unwrap: <T, E>(result: Result<T, E>): T => {
    if (result.ok) return result.value;
    throw result.error;
  },

  unwrapErr: <T, E>(result: Result<T, E>): E => {
    if (!result.ok) return result.error;
    throw new Error('Expected error but got success');
  },

  match: <T, E, U>(result: Result<T, E>, onOk: (value: T) => U, onErr: (error: E) => U): U =>
    result.ok ? onOk(result.value) : onErr(result.error),

  asyncMap: async <T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Promise<U>
  ): Promise<Result<U, E>> => {
    if (!result.ok) return Result.fail(result.error);
    try {
      const value = await fn(result.value);
      return Result.ok(value);
    } catch (error) {
      return Result.fail(error as E);
    }
  },

  asyncFlatMap: async <T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Promise<Result<U, E>>
  ): Promise<Result<U, E>> => {
    if (!result.ok) return Result.fail(result.error);
    return fn(result.value);
  },

  combine: <T extends readonly Result<any, any>[]>(
    results: T
  ): Result<
    { [K in keyof T]: T[K] extends Result<infer U, any> ? U : never },
    T[number] extends Result<any, infer E> ? E : never
  > => {
    const values = [] as any[];
    for (const result of results) {
      if (!result.ok) return Result.fail(result.error);
      values.push(result.value);
    }
    return Result.ok(values as any);
  },

  all: async <T, E>(
    promises: Promise<Result<T, E>>[]
  ): Promise<Result<T[], E>> => {
    const results = await Promise.all(promises);
    return Result.combine(results);
  },
};

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;