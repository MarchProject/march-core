import { ConfigService } from '@march/core'

import { ClientProviderOptions, Transport } from '@nestjs/microservices'

const config = ConfigService.load()

export const inventoryGrpcPackageName = 'inventory'
export const inventoryProtoPath = '../../../proto/inventory/index.proto'

export const inventoryGrpcClientName = 'INVENTORY_PACKAGE'
export const inventoryGrpcClientProvider: ClientProviderOptions = {
  name: inventoryGrpcClientName,
  transport: Transport.GRPC,
  options: {
    url: config.inventory.grpc.url,
    package: [inventoryGrpcPackageName],
    protoPath: [inventoryProtoPath],
  },
}