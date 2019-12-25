const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const server = require('http').Server(app);
const port = process.env.PORT || 3000;

const rooms = require("./rooms");


rooms(server);

app.use(cors());
app.use("/static", express.static("dist"));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

server.listen(port, () => console.log(`Example app listening on http://127.0.0.1:${port}`));
