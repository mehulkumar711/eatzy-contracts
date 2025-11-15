import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../auth/jwt-payload.interface'; // Adjust path if needed

/**
 * @User() decorator
 *
 * Extracts the entire JwtPayload object from the request.
 * Assumes the JwtAuthGuard has already run and attached
 * the payload to the request ('request.user').
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);