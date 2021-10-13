const transcoder = require('./ffmpeg')
const fs = require('fs');
const inject = require('./inject')
const path = require('path')
const parsePlaylist = require('./playlist');


module.exports = (filename) => {
    return new Promise((resolve, reject) => {
        transcoder(filename,(err,target_folder) => {
            if(err){
                return reject(err)
            }
            fs.readdir(target_folder, (err, files) => {
                const promises = files.map(file => {
                    if(file.includes('ts')){
                        return inject(path.join(target_folder,file))
                    }
                })
                Promise.all(promises).then(() => {
                    fs.unlink(filename,(err) => {
                        if (err){
                            reject(err)
                        }
                        resolve(parsePlaylist(target_folder+'/video.m3u8'))
                    })
                    }
                    )
              });
        })
    })
}