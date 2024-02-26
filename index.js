const express = require("express");
const app = express();
const http = require("http");
require("dotenv").config();
const cors = require("cors");
const colors=require("colors")
var bodyParser = require('body-parser')
require("./models")
const Connect = require("./config/db");
const userRoutes = require("./routes/User");
Connect();
const server = http.createServer(app);
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(userRoutes);
app.use("/uploads",express.static("uploads"));

PORT = process.env.PORT || 3000;
server.listen(PORT, (req,res) => {
  console.log(`http://localhost:${PORT}`);
  console.log(`Server running on PORT:${PORT}`);
});
