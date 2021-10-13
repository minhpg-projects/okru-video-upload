const CronJob = require('cron').CronJob;
const videoSchema = require('./models/video')
const got = require('got')
const videoQueue = require('./queues/video.queue')
const mongoose = require('mongoose')

require('dotenv').config();
mongoose.connect(process.env.MONGO_DB || 'mongodb://127.0.0.1/okru', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });


const task = new CronJob('0 5 * * *', async () =>  {
    const query = await videoSchema.find({okru_id:{$exists:true},processing:false,error:false}).exec()
    for(video of query){
        const alive = await checkDead(video.okru_id)
        if(!alive){
            fileId = video.drive_id
            await video.updateOne({
                processing: true,
                error: false,
                error_message: null
            }).exec()
            videoQueue.add(fileId, { drive_id: fileId, reup_count: video.reup_count })
        }
    }
}, null, true, 'Asia/Ho_Chi_Minh');

const checkDead = async (okru_id) => {
    try {
        const url = 'https://ok.ru/videoembed/' + okru_id
        const response = await got.get(url).text()
        if (response.includes(`OK.VideoPlayer.yandexError('COPYRIGHTS_RESTRICTED')`)) {
            console.log(`${okru_id} - dead`)
            return false
        }
        else {
            console.log(`${okru_id} - live`)
            return true
        }

    } catch (err) {
        console.error(err.message)
        return true
    }

}

task.start();
console.log(task.running);
