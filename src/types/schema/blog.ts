import { getNextStrId } from '../../utils'
  
  /*export type BlogType = {
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt?: string
  }*/

  export class BlogType {
    id: string
    createdAt?: string
    constructor(public name: string, public description: string, public websiteUrl: string) {
      this.id = getNextStrId()
      this.createdAt = new Date().toISOString()
    }
  }
