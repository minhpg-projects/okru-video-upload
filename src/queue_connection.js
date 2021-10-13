require('dotenv').config()
module.exports = {
    port: 6379,
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD || ''
}