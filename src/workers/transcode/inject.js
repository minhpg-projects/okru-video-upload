const fs = require('fs');

module.exports = (filename, callback) => {
    return new Promise((resolve,reject) => {
        fs.readFile(filename, (err, data) => {
            if(err){
                reject(err)
            }
            fs.readFile('base.png', (err, image_buffer) => {
                if(err){
                    reject(err)
                }
                const new_file = filename.replace('.ts', '.png')
                fs.writeFile(new_file, Buffer.from(Buffer.concat([image_buffer, data]), 'binary'), (err,info) => {   
                    if(err){
                        reject(err)
                    }            
                    fs.unlink(filename,(err,_) => {
                        if(err){
                            reject(err)
                        }
                        return resolve(new_file)
                    })
                })
            })
        })
    })

}