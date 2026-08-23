import { Result } from '@aquasystem/shared-kernel';

export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Result<Output>>;
}

export interface Query<Input, Output> {
  execute(input: Input): Promise<Result<Output>>;
}

export interface Command<Input, Output> {
  execute(input: Input): Promise<Result<Output>>;
}

export interface UseCaseHandler<Input, Output> {
  handle(input: Input): Promise<Result<Output>>;
}