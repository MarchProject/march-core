import { ConfigService } from '@march/core'

import { ClientProviderOptions, Transport } from '@nestjs/microservices'

const config = ConfigService.load()

export const authGrpcPackageName = 'auth'
export const authProtoPath = '../../proto/auth/index.proto'

export const authGrpcClientName = 'AUTH_PACKAGE'
export const authGrpcClientProvider: ClientProviderOptions = {
  name: authGrpcClientName,
  transport: Transport.GRPC,
  options: {
    url: config.auth.grpc.url,
    package: [authGrpcPackageName],
    protoPath: [authProtoPath],
  },
}