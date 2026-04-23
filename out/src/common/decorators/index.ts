import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract the current authenticated user from the request.
 * Usage: @CurrentUser() user: UserPayload
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

/**
 * Extract the tenant ID from the request.
 * Resolved by TenantMiddleware from URL params or auth token.
 * Usage: @TenantId() tenantId: string
 */
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
  },
);
