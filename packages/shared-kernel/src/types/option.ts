import { Result } from './result';

export type Option<T> =
  | { some: true; value: T }
  | { some: false; value: never };

export const Option = {
  some: <T>(value: T): Option<T> => ({ some: true, value }),
  none: <T>(): Option<T> => ({ some: false, value: undefined as never }),

  isSome: <T>(option: Option<T>): option is { some: true; value: T } => option.some,
  isNone: <T>(option: Option<T>): option is { some: false; value: never } => !option.some,

  map: <T, U>(option: Option<T>, fn: (value: T) => U): Option<U> =>
    option.some ? Option.some(fn(option.value)) : Option.none(),

  flatMap: <T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U> =>
    option.some ? fn(option.value) : Option.none(),

  filter: <T>(option: Option<T>, predicate: (value: T) => boolean): Option<T> =>
    option.some && predicate(option.value) ? option : Option.none(),

  getOrElse: <T>(option: Option<T>, defaultValue: T): T =>
    option.some ? option.value : defaultValue,

  getOrThrow: <T>(option: Option<T>, error?: Error): T => {
    if (option.some) return option.value;
    throw error || new Error('Option is none');
  },

  match: <T, U>(option: Option<T>, onSome: (value: T) => U, onNone: () => U): U =>
    option.some ? onSome(option.value) : onNone(),

  toResult: <T, E>(option: Option<T>, error: E): Result<T, E> =>
    option.some ? Result.ok(option.value) : Result.fail(error),

  fromNullable: <T>(value: T | null | undefined): Option<T> =>
    value != null ? Option.some(value) : Option.none(),

  fromResult: <T, E>(result: Result<T, E>): Option<T> =>
    result.ok ? Option.some(result.value) : Option.none(),
};

export type AsyncOption<T> = Promise<Option<T>>;