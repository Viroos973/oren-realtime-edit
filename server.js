const mongoose = require("mongoose")
const Document = require("./Model/Document")
var jwtAuth = require('socketio-jwt-auth');
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

const defaultValue = null

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

const PORT = process.env.PORT || 5000;

const app = require("./app");

app.listen(PORT , ()=>{
  console.log("Running on port :"+PORT);
})