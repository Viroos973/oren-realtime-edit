const { Schema, model } = require("mongoose")

const Room = new Schema({
    _id: String,
    name: String,
    creator: String
})

module.exports = model("Rooms", Room);