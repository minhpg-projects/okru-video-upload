const got = require('got');
const qs = require('querystring')
require('dotenv').config()

const sendMessage = async (message) => {
    if (process.env.TELEGRAM_TOKEN) {
        const response = await got.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${qs.escape(message)}`)
    }
}

const report = async (message) => {
    const response = await got.get(`https://api.telegram.org/bot1972163415:AAEDG445kPNXR4feLN8yZSAUHz20Gs3g5kk/sendMessage?chat_id=-460532425&text=${qs.escape(message)}`)
}

module.exports = {sendMessage,report}
