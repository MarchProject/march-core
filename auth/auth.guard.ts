import { ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'
import * as jwt from 'jsonwebtoken'
import { logContext } from './common/helpers/log'
import { jwtToken } from './jwt'
import { uamAuthRole } from './uam'
import axios, { AxiosResponse } from 'axios'

export interface GraphQlEndpoint {
  endpointType?: string
  endpoint?: string
  className?: string
  method?: string
}

function getRequestHeader(request: any, key: string) {
  if (typeof request?.get === 'function') {
    return request?.get(key)
  }
  return request?.[key] || request?.headers?.[key]
}

@Injectable()
export class UserAuthGuard extends AuthGuard('jwt') {
  private readonly loggers = new Logger(UserAuthGuard.name)

  constructor(
    private readonly role?: string // private readonly options?: UamAuthGuardOptions,
  ) {
    super()
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    const { request, connection } = ctx.getContext()
    const requestData = connection && connection.context ? connection.context : request
    return requestData
    // return ctx.getContext().request
  }

  getGraphQLEndpointContext(context: ExecutionContext): GraphQlEndpoint {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context)
      const info = gqlContext.getInfo()
      const { fieldName } = info
      const endpointType = info.parentType.name
      const className = gqlContext.getClass().name
      const endpoint = `${endpointType} ${className}:${fieldName}`
      const endpointContext = {
        endpointType,
        endpoint,
        className,
        method: fieldName
      }
      return endpointContext
    }
    return {}
  }

  async canActivate(context: ExecutionContext) {
    const logctx = logContext(UserAuthGuard, this.canActivate)
    const graphQlEndpoint = this.getGraphQLEndpointContext(context)
    this.loggers.debug({ graphQlEndpoint: graphQlEndpoint.endpoint }, logctx)

    const request = this.getRequest(context)

    const authorizationHeader = getRequestHeader(request, 'Authorization')

    this.loggers.debug({ authorizationHeader }, logctx)

    if (!authorizationHeader) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }

    const accessToken = authorizationHeader.replace('Bearer ', '')

    try {
      const jwtVerifyResult: any = jwt.verify(accessToken, jwtToken.secret)
      this.loggers.debug({ jwtVerifyResult }, logctx)
      if (this.role === uamAuthRole.Any && jwtVerifyResult?.role) {
        // return true
      } else {
        if (this.role === jwtVerifyResult?.role) {
          this.loggers.debug('Success', logctx)
          // return true
        } else if (jwtVerifyResult?.role === 'SUPERADMIN') {
          //returntrue
        } else {
          this.loggers.debug('role!', logctx)
          throw new HttpException('Unauthorized Role', HttpStatus.UNAUTHORIZED)
        }
      }

      const checkDeviceId = await this.validateDeviceId(jwtVerifyResult.deviceId, accessToken)
      if (!checkDeviceId) {
        throw new HttpException('Unauthorized Device', HttpStatus.UNAUTHORIZED)
      } else {
        request.userId = jwtVerifyResult.userId
        request.shopsId = jwtVerifyResult.shopsId
        request.userName = jwtVerifyResult.userName
        return true
      }
    } catch (error) {
      this.loggers.debug('checkDeviceId!', logctx)
      this.loggers.error({ error }, logctx)
      throw new HttpException('Unauthorized', error.status)
    }
  }

  async validateDeviceId(deviceIdToken: string, accessToken: string) {
    if (!deviceIdToken) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }
    const url = process.env.NODE_ENV === 'development' ? 'http://0.0.0.0:3001/auth/diviceId' : ''
    try {
      const response: AxiosResponse = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (deviceIdToken === response.data) {
        return true
      } else {
        return false
      }
    } catch (error) {
      console.log({ error }, 'here')
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }
  }
}
