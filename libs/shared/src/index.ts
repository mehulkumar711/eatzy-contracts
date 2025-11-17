// --- Auth ---
export * from './auth/jwt-auth.guard';
export * from './auth/roles.decorator';
export * from './auth/roles.guard';
export * from './auth/jwt-payload.interface';
export * from './auth/jwt.strategy';

//
// --- THE FIX (v1.45): Export the entity and the renamed decorator ---
//

// 1. Export the TypeORM entity
export * from './database/entities/user.entity';

// 2. Export the NestJS decorator
export * from './decorators/current-user.decorator';