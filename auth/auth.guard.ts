import { ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'
import * as jwt from 'jsonwebtoken'
import { logContext } from './common/helpers/log'
import { jwtToken } from './jwt'
import { uamAuthRole } from './uam'
import axios, { AxiosResponse } from 'axios'
import { get } from 'lodash'

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
    const graphQlEndpoint: GraphQlEndpoint = this.getGraphQLEndpointContext(context)
    this.loggers.debug({ graphQlEndpoint: graphQlEndpoint }, logctx)

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
      } else {
        if (jwtVerifyResult?.role === 'SUPERADMIN') {
        } else {
          this.loggers.debug('role!', logctx)
          throw new HttpException('Unauthorized Role', HttpStatus.UNAUTHORIZED)
        }
      }
      const checkDeviceId = await this.validateDeviceId(
        jwtVerifyResult.deviceId,
        accessToken,
        graphQlEndpoint,
        jwtVerifyResult?.info?.tasks
      )
      if (!checkDeviceId) {
        throw new HttpException('Unauthorized Device', HttpStatus.UNAUTHORIZED)
      } else {
        this.loggers.debug(
          'userInfoLogs',
          {
            userId: jwtVerifyResult.userId,
            shopId: jwtVerifyResult.shopsId,
            userName: jwtVerifyResult.userName,
            tasks: jwtVerifyResult.info.tasks
          },
          logctx
        )
        request.userId = jwtVerifyResult.userId
        request.shopsId = jwtVerifyResult.shopsId
        request.userName = jwtVerifyResult.userName
        request.taskServices = jwtVerifyResult.info.tasks
        return true
      }
    } catch (error) {
      this.loggers.debug('checkDeviceId!', logctx)
      this.loggers.error({ error }, logctx)
      if (error?.message === 'jwt expired') {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
      }
      throw new HttpException(get(error, 'message', 'Internal Error'), get(error, 'status', 500))
    }
  }

  async validateDeviceId(
    deviceIdToken: string,
    accessToken: string,
    graphQlEndpoint: GraphQlEndpoint,
    userTask: string[]
  ) {
    const logctx = logContext(UserAuthGuard, this.validateDeviceId)
    if (!deviceIdToken) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }
    const url = process.env.UAM_URL
    this.loggers.debug({ url, userTask }, logctx)
    try {
      const response: AxiosResponse = await axios.post(
        url,
        { data: graphQlEndpoint },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          responseType: 'json'
        }
      )
      this.loggers.debug({ response: response.data }, logctx)
      this.loggers.debug({ len: response?.data?.scopes.length }, logctx)
      if (deviceIdToken === response?.data?.deviceId) {
        if (response?.data?.scopes.length > 0) {
          return this.verifyUserGroups(response?.data?.scopes, userTask)
        } else {
          return true
        }
      } else {
        return false
      }
    } catch (error) {
      console.log({ error }, 'error')
      throw new HttpException(get(error, 'message', 'Internal Error'), get(error, 'status', 500))
    }
  }

  async checkTaskId(tasks: string[], userTasks: string[]) {
    const logctx = logContext(UserAuthGuard, this.checkTaskId)
    this.loggers.debug({ tasks: tasks.length, userTasks }, logctx)
    if (tasks.length > 1) {
      const checkSomeTask = tasks.some(e => {
        return userTasks.includes(e)
      })
      this.loggers.debug({ checkSomeTask }, logctx)
      if (!checkSomeTask) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
      }
    } else {
      const checkEveryTask = tasks.every(e => {
        return userTasks.includes(e)
      })
      this.loggers.debug({ checkEveryTask }, logctx)
      if (!checkEveryTask) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
      }
    }
  }

  verifyUserGroups(scopes: string[], userGroups: string[]) {
    const logctx = logContext(UserAuthGuard, this.verifyUserGroups)
    this.loggers.debug({ scopes, userGroups }, logctx)

    const group = scopes.find(group => {
      return userGroups.indexOf(group) > -1
    })
    this.loggers.debug({ group }, logctx)

    if (!group) {
      throw new HttpException('Permission', HttpStatus.UNAUTHORIZED)
    }

    return true
  }
}
