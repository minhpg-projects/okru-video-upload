const mongoose = require('mongoose');

const CookieSchema = new mongoose.Schema({
    data: {
        type: String,
        required: true
    },
    mail: {
        type: String

    }, password: {
        type: String
    },
    disabled: {
        type: Boolean,
        required: true
    }
});
module.exports = mongoose.model('okru-cookies', CookieSchema)