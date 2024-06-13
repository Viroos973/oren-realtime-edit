const { Schema, model } = require("mongoose")

const Document = new Schema({
  _id: String,
  data: Object,
  columns: Object
})

module.exports = model("Document", Document)