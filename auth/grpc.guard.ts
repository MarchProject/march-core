import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class GrpcAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext): boolean {
    function getRequestHeader(request: any, key: string) {
      if (typeof request?.get === 'function') {
        return request?.get(key)
      }
      return request?.[key] || request?.headers?.[key]
    }
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    )
    if (isPublic) {
      return true
    }
    const ctx = context.switchToRpc()
    const request = ctx.getContext()

    const authorizationHeader = getRequestHeader(request, 'Authorization')
    console.log({ authorizationHeader })
    return request
  }
}
