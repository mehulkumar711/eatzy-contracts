// --- Auth ---
export * from './auth/jwt-auth.guard';
export * from './auth/roles.decorator';
export * from './auth/roles.guard';
export * from './auth/jwt-payload.interface';
export * from './auth/jwt.strategy';

// --- Decorators ---
export * from './decorators/user.decorator';

//
// --- THE FIX (v1.42): Export the User entity ---
//
export * from './database/entities/user.entity';