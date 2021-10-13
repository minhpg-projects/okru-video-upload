const videoSchema = require('../../models/video')


module.exports = async (req,res) => {
    const fileId = req.params.id
    const video = await videoSchema.findOne({drive_id: fileId}).exec()
    if (video) {
        var data = {
            processing: video.processing,
            error: video.error,
            error_message: video.error_message,
        }
        if(video.okru_id){
            data.embed = 'https://ok.ru/videoembed/'+video.okru_id
        }
        res.json({
            status: 'ok',
            data: data
        })
    }
    else {
        res.json({
            status: 'error',
            message: 'video does not exist'
        })
    }
    res.end()
}