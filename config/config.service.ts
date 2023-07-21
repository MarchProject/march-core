import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'
import { config } from '../types/config'

import { Injectable } from '@nestjs/common'

@Injectable()
export class ConfigService {
  private static config: config.Config

  static load(): config.Config {
    if (this.config) {
      return this.config
    }

    const configPath = path.resolve('config.yaml')
    // console.log({ configPath })

    if (!fs.existsSync(configPath)) {
      if (process.env.NODE_ENV === 'test') {
        return null
      }

      throw new Error('Missing config.yaml!!')
    }

    this.config = yaml.load(fs.readFileSync(configPath, 'utf8')) as config.Config

    if (process.env.NODE_ENV === 'development') {
      console.log('Config loaded successfully', { config: this.config })
    } else {
      console.log('Config loaded successfully')
    }
    return this.config
  }
}
