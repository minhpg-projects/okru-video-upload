const m3u8Parser = require('m3u8-parser')
const fs = require('fs');
const path  = require('path');

module.exports = (filename) => {
    return new Promise((resolve, reject) =>
    {
        fs.readFile(filename,{},(err,data) =>{
            if(err){
                reject(err)
            }
            const parser = new m3u8Parser.Parser()
            parser.push(data)
            parser.end()
            parser.manifest.segments.forEach(segment => {
                segment.filename = segment.uri
                segment.uri = path.join(filename.replace('video.m3u8',''),segment.uri.replace('.ts','.png'))
            })
            return resolve(parser.manifest)
        })    
    })
}