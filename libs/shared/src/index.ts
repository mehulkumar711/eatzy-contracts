// --- Auth ---
export * from './auth/jwt-auth.guard';
export * from './auth/roles.decorator';
export * from './auth/roles.guard';
export * from './auth/jwt-payload.interface';
// export * from './auth/jwt.strategy'; // <-- REMOVED (The Fix)

// --- Decorators ---
export * from './decorators/current-user.decorator'; // Use v1.45 name

// --- Database ---
export * from './database/entities/user.entity';