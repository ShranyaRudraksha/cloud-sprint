const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");

const requestRoutes = require("./routes/requestRoutes");
const s3Routes = require("./routes/s3Routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/s3", s3Routes);
app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));