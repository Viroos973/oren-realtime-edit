const mongoose = require("mongoose")
const Document = require("./Model/document.model")
const jwtAuth = require('socketio-jwt-auth');
const User = require("./Model/user.model");

mongoose.connect("mongodb://127.0.0.1:27017/google-docs-clone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
}).then(() => {
  console.log('Connected to MongoDB successfully');
}).catch((error) => {
  console.error('Connection error:', error);
});

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

io.use(jwtAuth.authenticate({
  secret: 'secret',    // required, used to verify the token's signature
  algorithm: 'HS256'        // optional, default to be HS256
}, function(payload, done) {
  // done is a callback, you can use it as follows
  User.findOne({id: payload.sub}, function(err, user) {
    if (err) {
      // return error
      return done(err);
    }
    if (!user) {
      // return fail with an error message
      return done(null, false, 'user does not exist');
    }
    // return success with a user info
    return done(null, user);
  });
}));

io.on("connection", socket => {
  socket.on("get-document", async (tableId, roomId) => {
    const table = await findDocumentOrNull(tableId, roomId)

    if (table == null) {
      socket.emit("load-document", false)
    } else {
      socket.join(tableId)
      socket.emit("load-document", true, table.data, table.columns)
    }

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

async function findDocumentOrNull(tableId, roomId) {
  if (tableId == null || roomId == null) return

  const document = await Document.findOne({_id: tableId, room_id: roomId})
  if (document) return document
  return null
}

const PORT = process.env.PORT || 5000;

const app = require("./app");

app.listen(PORT , ()=>{
  console.log("Running on port :"+PORT);
})