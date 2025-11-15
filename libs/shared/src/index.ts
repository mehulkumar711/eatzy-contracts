export * from './auth/jwt-auth.guard';
export * from './auth/roles.decorator';
export * from './auth/roles.guard';
export * from './auth/jwt-payload.interface';

// This exports the @User() decorator
export * from './decorators/user.decorator';

// This exports the strategy you just moved
export * from './auth/jwt.strategy';