const getVideoInfo = require('./GetVideoInfo')
const download = require('./Aria')
const parseStream = require('./ParseFmtStream')

module.exports = (fileid) => {
    return getVideoInfo(fileid).then((response) => {
        const cookie = response.headers['set-cookie']
        cookie.push(process.env.COOKIE)
        const parsed_stream = parseStream(response.body, cookie, fileid)
        return parsed_stream
    }).then(parsed_stream => {download(parsed_stream[0])})
}
