const videoSchema = require('../models/video')
const express = require('express')
const router = express.Router()

router.get('/clear-cache', async (req, res) => {
    try {
        await levelClient.clear()
        res.json({'status' : 'ok'})
    }
    catch(err) {
        res.json({'status' : 'error','message': err.message})
    }
    res.end()
})

router.get('/videos', async (req,res) => {
    const completed_videos = await videoSchema.countDocuments({processing:false,error:false}).exec()
    const processing = await videoSchema.countDocuments({processing:true}).exec()
    const errors = await videoSchema.countDocuments({error:true}).exec()
    res.json({
        done: completed_videos,
        processing: processing,
        errors: errors
    })
    return
})

router.get('/errors', async (req,res) => {
    const error_videos = await videoSchema.find({error:true}).select({_id:0,error_message:1,drive_id:1}).sort({_id:-1}).exec()
    res.json(error_videos)
    return
})

router.get('/done', async (req,res) => {
    const error_videos = await videoSchema.find({"okru_id": { "$exists": true }}).select({_id:0,title:1,drive_id:1}).sort({_id:-1}).limit(100).exec()
    res.json(error_videos)
    return
})

router.get('/processing', async (req,res) => {
    const error_videos = await videoSchema.find({processing:true}).select({_id:0,drive_id:1}).sort({_id:-1}).exec()
    res.json(error_videos)
    return
})

router.get('/clear-errors', async (req,res) => {
    try {
        const error_videos = await videoSchema.deleteMany({error:true}).exec()
        res.json({
            status: 'ok' 
        })
    }
    catch(err) {
        res.json({
            status: 'failed',
            message: err.message
        })
    }
    return
})

module.exports = router