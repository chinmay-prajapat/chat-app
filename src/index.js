const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const Filter = require("bad-words")
const express = require("express")
const { generateMessage } = require("./utils/messages")
const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, "../public")
app.use(express.static(publicDirectoryPath))

io.on("connection", (socket) => {
  socket.emit("message", generateMessage("Welcome!"))

  socket.broadcast.emit("message", generateMessage("New user joined!"))

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter()
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed")
    }
    io.emit("message", generateMessage(message))
    callback()
  })

  socket.on("sendLocation", (data, callback) => {
    io.emit("locationMessage", data)
    callback()
  })

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("User has been disconnected"))
  })
})

server.listen(port, () => {
  console.log(`The server is running on ${port}`)
})
