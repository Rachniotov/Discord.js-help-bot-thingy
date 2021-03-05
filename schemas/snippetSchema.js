const mongoose = require("mongoose");

// schema for storing things that map stores
const reqStr = {
    type: String,
    required: true
}
const schema = new mongoose.Schema({
    id: reqStr,
    toDetect: {
        type: Array,
        required: true
    },
    toAnswer: reqStr,
    guild: reqStr,
    by: {
        id: reqStr,
        tag: reqStr,
        createdAt: reqStr
    }
})
module.exports = mongoose.model("snippets", schema);