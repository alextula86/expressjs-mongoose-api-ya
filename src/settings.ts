export const settings = {
  MONGO_URI: process.env.JWT_SECRET || 'mongodb://localhost:27017',
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || '111',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || '222',
}
