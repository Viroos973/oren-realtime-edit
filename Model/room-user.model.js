const { Schema, model } = require("mongoose")

const Room_User = new Schema({
    room_id: String,
    user_id: String
})

module.exports = model("RoomUser", Room_User);