const videoSchema = require('../../models/video')
const videoQueue = require('../../queues/video.queue')

module.exports = async (req,res) => {
    const fileId = req.params.id
    const videos = await videoSchema.find({error : true}).exec()
    const promises = videos.map(video => {
        return new Promise(async (resolve,reject) => {
            try {
                await video.updateOne({error:false,error_message:null,processing:true}).exec()
                videoQueue.add(video.drive_id, { drive_id: video.drive_id,reup_count: video.reup_count })
                resolve(video)
            }
            catch(err){
                reject(err)
            }
        })
    })
    Promise.all(promises).then((videos) => {
        res.json({
            status: 'ok',
            message: 'queued errored videos',
            videos: videos
        })
        res.end()
        return
     })
}