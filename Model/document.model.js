const { Schema, model } = require("mongoose")

const DocumentModel = new Schema({
  _id: String,
  room_id: String,
  name: String,
  data: Object,
  columns: Object
})

module.exports = model("Document", DocumentModel)