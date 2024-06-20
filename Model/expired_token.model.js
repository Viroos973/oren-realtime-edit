const { Schema, model } = require("mongoose")

const Expired_Token = new Schema({
    expired_token: String
})

module.exports = model("ExpiredToken", Expired_Token);