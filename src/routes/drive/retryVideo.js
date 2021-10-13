const videoSchema = require('../../models/video')
const videoQueue = require('../../queues/video.queue')

module.exports = async (req, res) => {
    const fileId = req.params.id
    const video_in_db = await videoSchema.findOne({ drive_id: fileId }).exec()
    if (!video_in_db) {
        res.json({
            status: 'failed',
            message: 'video does not exist',
            drive_id: fileId
        })
        res.end()
    }
    else {
        await video_in_db.updateOne({
            processing: true,
            error: false,
            error_message: null
        }).exec()
        videoQueue.add(fileId, { drive_id: fileId, reup_count: video_in_db.reup_count })
        res.json({
            status: 'ok',
            message: 'video queued',
            drive_id: fileId
        })
        res.end()
    }
}