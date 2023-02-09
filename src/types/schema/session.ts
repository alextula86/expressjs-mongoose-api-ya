import { getNextStrId } from '../../utils'

export class SessionType {
  id: string
  issuedAtt: string
  attempt: number
  constructor(
    public ip: string,
    public deviceTitle: string,
    public url: string,
  ) {
    this.id = getNextStrId()
    this.issuedAtt = new Date().toISOString()
    this.attempt = 1
  }
}