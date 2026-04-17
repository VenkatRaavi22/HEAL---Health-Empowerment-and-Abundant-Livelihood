const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const symptomRoutes = require("./routes/symptomRoutes");
const profileRoutes = require("./routes/profileRoutes");
const logRoutes = require("./routes/logRoutes");
const riskRoutes = require("./routes/riskRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const medicationRoutes = require("./routes/medicationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const specialistRoutes = require("./routes/specialistRoutes");


const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/chatbot", chatRoutes);
app.use("/api/specialists", specialistRoutes);


app.get("/", (req, res) => {
  res.send("HEAL Backend API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
