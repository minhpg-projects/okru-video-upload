const express = require('express');
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const app = express();
const { report } = require('./telegram-api/sendMessage')
const publicIp = require('public-ip');
const got = require('got')

dotenv.config()
const PORT = process.env.PORT || 3000

mongoose.connect(process.env.MONGO_DB || 'mongodb://127.0.0.1/okru', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
app.set('view engine', 'ejs')

app.use((req, res, next) => {
    const ip =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    const time = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh'
    });
    console.log(`${req.url} - ${ip} - ${time}`)
    next()
})

app.use('/api/private', async (req, res, next) => {
    if (process.env.API_KEY) {
        if (req.query.key != process.env.API_KEY) {
            res.status(404)
            res.end()
        }
        else {
            next()
        }
    }
    else {
        next()
    }
})

app.get('/api/private/drive/delete/:id', require('./routes/drive/deleteVideo'))
app.get('/api/private/drive/retry', require('./routes/drive/retryVideos'))
app.get('/api/private/drive/retry/:id', require('./routes/drive/retryVideo'))
app.get('/api/private/drive/create/:id', require('./routes/drive/createVideo'))
app.get('/api/private/drive/get/:id', require('./routes/drive/getVideo'))
app.use('/api/private/stat', require('./routes/stat'))


app.listen(PORT, async () => {
    console.log(`listening on port ${PORT}`)
})