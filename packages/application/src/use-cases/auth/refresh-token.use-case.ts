import { inject, injectable } from 'inversify';
import { Result } from '@aquasystem/shared-kernel';
import { RefreshTokenCommand, RefreshTokenResult } from '../../dto/auth.dto';
import { UseCase } from '../../ports/inbound/use-case.port';
import { TYPES } from '../../types';
import { TokenGeneratorPort } from '../../ports/outbound';

@injectable()
export class RefreshTokenUseCase implements UseCase<RefreshTokenCommand, RefreshTokenResult> {
  constructor(
    @inject(TYPES.TokenGeneratorPort) private readonly tokens: TokenGeneratorPort
  ) {}

  async execute(command: RefreshTokenCommand): Promise<Result<RefreshTokenResult>> {
    const result = await this.tokens.refreshAccessToken(command.refreshToken);
    if (!result.ok) return Result.fail(result.error);

    return Result.ok({
      accessToken: result.value,
      expiresIn: 3600,
    });
  }
}