const express = require("express");
const districtRoutes = require("./routes/districtRoutes");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.use("/api/districts", districtRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});