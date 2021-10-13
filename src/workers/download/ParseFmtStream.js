'use strict'

const qs = require('querystring')

module.exports = (string, cookie, fileid) => {
    const data = qs.parse(string)
    if (data.status != 'ok') {
        throw new Error(data.reason)
    }
    else {
        const fmt_stream_map = data.fmt_stream_map
        const parsed = FmtParser(fmt_stream_map, cookie, fileid)
        const streams = parsed.sort((a, b) => {
                return b.res - a.res
            })
        return {
            'title': data.title,
            'streams': streams
            }
    }
}


const FmtParser = (string, cookie, fileid) => {
    const list = []
    const videos = string.split(',')
    videos.forEach((item) => {
        const components = item.split('|')
        const itag = parseInt(components[0])
        const res = getVideoResolution(itag)
        if(res<1080){
            list.push({
                'itag': itag,
                'url': components[1],
                'res': res,
                'cookie': cookie,
                'filename': res + '_' + fileid + '.mp4'
            })
        }
    })
    return list
}



const getVideoResolution = (itag) => {
    const videoCode = {
        '18': 360,
        '59': 480,
        '22': 720,
        '37': 1080
    }
    return videoCode[itag] || 0
}
