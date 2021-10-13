const request = require('request-promise');
const fs = require('fs');

const getProxy = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(process.env.PROXY_LIST, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            }
            var obj = JSON.parse(data)
            var proxy = obj[Math.floor(Math.random() * obj.length)];
            resolve('http://' + proxy.auth + '@' + proxy.ip + ':' + proxy.port)
        })
    })
}

module.exports = async (fileid) => {
    const proxy = await getProxy()
    return (request({
        url: 'https://docs.google.com/get_video_info?docid=' + fileid,
        method: "GET",
        proxy: proxy,
        resolveWithFullResponse: true,
        headers: {
            'cookie': process.env.COOKIE,
            'user-agent': process.env.USER_AGENT
        },
    }))
}