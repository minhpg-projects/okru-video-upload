const fs = require('fs')
const request = require('request')
const request_progress = require('request-progress')



module.exports = (file) => {
    return new Promise((resolve, reject) => {
        var headers = Object.assign({}, {
            cookie: file.cookie
        })
        headers.cookie.push(process.env.COOKIE)
        const playback = request({
            url: file.url,
            method: "GET",
            resolveWithFullResponse: true,
            headers: headers
        })
        request_progress(playback)
        .on('progress', state => {
            console.log(state.percent)
        })
        .on('end', () => {
            resolve(file.filename)
        })
        .pipe(fs.createWriteStream(file.filename))

    })

}
