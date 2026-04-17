require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
const DBconnection = require("./src/utils/DBconnection");
DBconnection();

// Routes
const userRoutes = require("./src/routes/UserRoutes");
app.use("/api/user", userRoutes);

const pgRoutes = require("./src/routes/PgRoutes");
app.use("/api/pg", pgRoutes);

const roomRoutes = require("./src/routes/RoomRoutes");
app.use("/api/room", roomRoutes);

const paymentRoutes = require("./src/routes/PaymentRoutes");
app.use("/api/payment", paymentRoutes);

const complaintRoutes = require("./src/routes/ComplaintRoutes");
app.use("/api/complaint", complaintRoutes);

const foodRoutes = require("./src/routes/FoodRoutes");
app.use("/api/foodMenu", foodRoutes);

const noticeRoutes = require("./src/routes/NoticeRoutes");
app.use("/api/notice", noticeRoutes);

const reviewRoutes = require("./src/routes/ReviewRoutes");
app.use("/api/review", reviewRoutes);

const tenantRequestRoutes = require("./src/routes/TenantRequestRoutes");
app.use("/api/tenant-request", tenantRequestRoutes);

// Test Route (optional but useful)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});