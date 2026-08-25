import { injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import { TokenGeneratorPort, TokenPayload } from '@aquasystem/application';
import { User } from '@aquasystem/domain';
import { Result } from '@aquasystem/shared-kernel';

@injectable()
export class JwtTokenGenerator implements TokenGeneratorPort {
  private readonly secret: string = process.env.JWT_SECRET || 'aquapure-super-secret-jwt-key-min-32-chars-2026';
  private readonly refreshSecret: string = process.env.JWT_REFRESH_SECRET || 'aquapure-super-secret-refresh-jwt-key-min-32-chars-2026';
  private readonly expiresIn: string = process.env.JWT_EXPIRES_IN || '8h';
  private readonly refreshExpiresIn: string = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  async generateAccessToken(user: User): Promise<string> {
    const payload: TokenPayload = {
      sub: user.id.value,
      email: user.email.value,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 8 * 3600,
    };
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as any });
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload = {
      sub: user.id.value,
      email: user.email.value,
      role: user.role,
    };
    return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn as any });
  }

  async verifyAccessToken(token: string): Promise<Result<TokenPayload>> {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return Result.ok(decoded);
    } catch (err: any) {
      return Result.fail(new Error(err.message || 'Invalid token'));
    }
  }

  async verifyRefreshToken(token: string): Promise<Result<TokenPayload>> {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as TokenPayload;
      return Result.ok(decoded);
    } catch (err: any) {
      return Result.fail(new Error(err.message || 'Invalid refresh token'));
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<Result<string>> {
    const verification = await this.verifyRefreshToken(refreshToken);
    if (!verification.ok) {
      return Result.fail(verification.error);
    }
    const { sub, email, role } = verification.value;
    const newAccessToken = jwt.sign(
      { sub, email, role, iat: Math.floor(Date.now() / 1000) },
      this.secret,
      { expiresIn: this.expiresIn as any }
    );
    return Result.ok(newAccessToken);
  }
}
