import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import { expressOauth } from '@feathersjs/authentication-oauth';
import { container, TYPES } from './infrastructure/config/di.container';

export const authentication = (app: any) => {
  const config = app.get('authentication');

  // Register authentication service
  app.use('/authentication', new AuthenticationService(app, config));

  // Register JWT strategy
  const jwtStrategy = new JWTStrategy();
  app.authenticate('jwt', jwtStrategy);

  // Register local strategy
  const localStrategy = new LocalStrategy();
  app.authenticate('local', localStrategy);

  // Configure strategies
  const jwtSecret = process.env.JWT_SECRET || config.secret;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || config.refreshSecret;

  // JWT Strategy options
  app.set('jwtStrategy', {
    name: 'jwt',
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

  // Local Strategy options
  app.set('localStrategy', {
    name: 'local',
    entity: 'user',
    service: 'users',
    usernameField: 'email',
    passwordField: 'password',
  });

  // OAuth (optional - for future Google/Microsoft login)
  if (config.oauth) {
    app.configure(expressOauth());
  }

  // Hook to validate JWT and attach user
  app.hooks({
    before: {
      all: [
        // Skip authentication for health check and auth endpoints
        (context: any) => {
          const skipPaths = ['/health', '/authentication'];
          if (skipPaths.some((path) => context.path.startsWith(path))) {
            return context;
          }
          return context;
        },
      ],
    },
  });
};