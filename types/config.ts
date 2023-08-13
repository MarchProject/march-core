export namespace config {
  export type EndpointConfig = {
    host?: string
    port?: number
    url?: string
    apiBaseUrl?: string
    webBaseUrl?: string
    websocketUrl?: string
  }

  export type ServiceConfig = {
    rest: EndpointConfig
    grpc: EndpointConfig
    graphql: EndpointConfig
  }

  export type Config = {
    auth?: ServiceConfig
    inventory?: ServiceConfig
    user?: ServiceConfig
  }
}
