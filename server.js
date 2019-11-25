const express = require("express");
const path = require("path");
const cors = require("cors");


const app = express();
const port = 3000;

app.use(cors());
app.use("/static", express.static("dist"));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.listen(port, () => console.log(`Example app listening on http://127.0.0.1:${port}`))