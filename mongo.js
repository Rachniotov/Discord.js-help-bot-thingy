// simple utility for connecting to mongoose
// Credit - WornOffKeys
// oh and also, dont forget to put your mongo url in your config.json
const mongoose = require("mongoose");
const { mongo } = require("./config.json");

module.exports = async () => {
    await mongoose.connect(mongo, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    return mongoose;
}