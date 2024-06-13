const mongoose = require("mongoose")
const Document = require("./Document")

mongoose.connect("mongodb://localhost/google-docs-clone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

const defaultValue = null

io.on("connection", socket => {
  socket.on("get-document", async tableId => {
    const table = await findOrCreateDocument(tableId)
    socket.join(tableId)
    socket.emit("load-document", table.data, table.columns)

    socket.on("click-mouse", (row, col, userId) => {
      socket.broadcast.to(tableId).emit("set-color", row, col, userId)
    })

    socket.on("no-click-mouse", (userId) => {
      socket.broadcast.to(tableId).emit("delete-color", userId)
    })

    socket.on("send-changes", delta => {
      socket.broadcast.to(tableId).emit("receive-changes", delta)
    })

    socket.on("send-cols", (cols, title) => {
      socket.broadcast.to(tableId).emit("receive-cols", cols, title)
    })

    socket.on("save-document", async (data, columns) => {
      await Document.findByIdAndUpdate(tableId, { data, columns })
    })
  })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue, columns: defaultValue })
}