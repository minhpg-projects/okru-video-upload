
const puppeteer = require('puppeteer')

module.exports = async () => {
    return await puppeteer.launch({headless: true,args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']})
}
