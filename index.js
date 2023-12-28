const express = require("express");
const http = require("http");
require("dotenv").config();
const cors = require("cors");
const Connect=require("./config/db")
const userRoutes=require("./routes/User");
Connect()
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(userRoutes);

app.get("/", (req, res) => {
  res.send("<h1>hello world</h1>");
});

PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  console.log(`Server running on PORT:${PORT}`);
});
