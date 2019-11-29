const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

const port = 3000;

app.use(cors());
app.use("/static", express.static("dist"));
app.use('/static', express.static(__dirname + '/node_modules/normalize.css/'));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.listen(port, () => console.log(`Example app listening on http://127.0.0.1:${port}`))
