import mongoose from 'mongoose'
const { Schema } = mongoose
import { getNextStrId } from '../../utils'
  
export class BlogType {
  id: string
  createdAt?: string
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {
    this.id = getNextStrId()
    this.createdAt = new Date().toISOString()
  }
}
