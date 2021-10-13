const { Queue } = require('bullmq')
require('dotenv').config()
const queue = new Queue('okru',{connection: require('../queue_connection')})

module.exports = queue