const { Worker } = require('bullmq')
const videoSchema = require('../models/video')
const cookieSchema = require('../models/cookies')
const mongoose = require('mongoose');
const {sendMessage} = require('../telegram-api/sendMessage')
const publicIp = require('public-ip');
const authDrive = require('../google-drive-api/serviceAccountAuth')
const downloadDrive = require('../google-drive-api/download')
const uploadOkru = require('../okru')
const uuid = require('uuid')
const fs = require('fs')


require('dotenv').config();
mongoose.connect(process.env.MONGO_DB || 'mongodb://127.0.0.1/okru', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });


const getCookie = async () => {
    const count = await cookieSchema.countDocuments({ disabled: false }).exec()
    var random = Math.floor(Math.random() * count)
    const account = await cookieSchema.findOne({ disabled: false }).skip(random).exec()
    return account
}

const workerProcess = async (fileid,reup_count) => {
    return new Promise(async (resolve, reject) => {
        const filename = uuid.v4()
        try {
            const cookie = await getCookie()
            const drive = await authDrive()
            const video_file = await downloadDrive(drive,fileid,filename)
            const file_stat = await fs.promises.stat(video_file)
            const file_size = file_stat.size
            console.log('file size: '+file_size)
            console.log('reup count: '+reup_count)
            await fs.promises.truncate(video_file,file_size - reup_count)
            const okru_id = await uploadOkru(video_file,cookie)
            await fs.promises.unlink(filename)
            console.log(`uploaded to https://ok.ru/videoembed/${okru_id}`)
            resolve(okru_id)
        }   
        catch (err) {
            if(fs.existsSync(filename)){
                await fs.promises.unlink(filename)
            }
            reject(err)
        }
    })
};


const worker = new Worker('okru', async job => {
    const fileid = job.data.drive_id
    const reup_count = job.data.reup_count
    console.log('starting job for video ' + fileid)
    await sendMessage(`*Start process\nFileId: https://drive.google.com/file/d/${fileid}/view\nWorker IP: ${await publicIp.v4()}`)
    try {
        okru_id = await workerProcess(fileid,reup_count)
        await videoSchema.updateOne({ drive_id: fileid }, {
            processing: false,
            error: false,
            okru_id: okru_id,
            error_message: null
        }).exec()
        await videoSchema.updateOne({ drive_id: fileid },{$inc : {reup_count : 1}})
        await sendMessage(`*Success\nFileId: https://drive.google.com/file/d/${fileid}/view\nEmbed: https://ok.ru/videoembed/${okru_id}\nWorker IP: ${await publicIp.v4()}`)
    }
    catch (err) {
        console.error(err)
        await sendMessage(`*Error\nFileId: https://drive.google.com/file/d/${fileid}/view\nError Message: ${err.message}\nWorker IP: ${await publicIp.v4()}`)
        await videoSchema.updateOne({ drive_id: fileid }, {
            processing: false,
            error: true,
            error_message: err.message
        }).exec()
    }
    return
}, { concurrency: 5, connection: require('../queue_connection') });

worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
});
