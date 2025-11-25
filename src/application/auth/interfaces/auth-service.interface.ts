export interface IAuthService {
  /**
   * Registers a new user and returns access + refresh tokens.
   * Throws if email already exists.
   */
  register(
    email: string,
    password: string,
    name: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  /**
   * Logs in existing user and returns new access + refresh tokens.
   * Throws if credentials are invalid.
   */
  login(
    email: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  /**
   * Issues new tokens using a valid refresh token.
   * Throws if the refresh token is invalid or expired.
   */
  refresh(
    userId: string,
    token: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}
