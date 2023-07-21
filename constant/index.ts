import * as fs from 'fs'

const uamPubkeyPath = '.key/uam.pub'

export class Constant {
  static appName = 'issuer-api'
  static timezone = 'Asia/Bangkok'
  static date = 'YYYY-MM-DD'
  static ndidRequested = 'ndidRequested'

  private _uamPublicKeyPath = ''
  get uamPublicKeyPath() {
    return this._uamPublicKeyPath
  }

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      if (!fs.existsSync(uamPubkeyPath)) {
        throw new Error(`UAM public key is not set: ${uamPubkeyPath}`)
      }

      const pubkey = fs.readFileSync(uamPubkeyPath, 'utf-8')
      if (!pubkey) {
        throw new Error(`Invalid UAM public key: ${uamPubkeyPath}`)
      }

      this._uamPublicKeyPath = fs.readFileSync(uamPubkeyPath, 'utf-8')
    }

    // console.log({ uamPublicKeyPath: this._uamPublicKeyPath })
  }
}
