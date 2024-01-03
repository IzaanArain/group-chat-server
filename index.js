require("./models")
const express = require("express");
const http = require("http");
require("dotenv").config();
const cors = require("cors");
const Connect = require("./config/db");
const userRoutes = require("./routes/User");
const app = express();
Connect();
const server = http.createServer(app);
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(userRoutes);
app.use("/uploads",express.static("uploads"));

PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  console.log(`Server running on PORT:${PORT}`);
});
