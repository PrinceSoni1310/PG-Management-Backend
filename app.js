const express = require("express")
const app = express()
const cors = require ("cors")

app.use(express.json())
app.use(cors())

const DBconnection = require("./src/utils/DBconnection")
DBconnection()

const userRoutes = require("./src/routes/UserRoutes")
app.use("/user",userRoutes)

const pgRoutes = require("./src/routes/PgRoutes")
app.use("/pg",pgRoutes)

const roomRoutes = require("./src/routes/RoomRoutes")
app.use("/room",roomRoutes)

const paymentRoutes = require("./src/routes/PaymentRoutes")
app.use("/payment" ,paymentRoutes)

const complaintRoutes = require("./src/routes/ComplaintRoutes")
app.use("/complaint",complaintRoutes)

const foodRoutes = require("./src/routes/FoodRoutes")
app.use("/foodMenu",foodRoutes)

const noticeRoutes = require("./src/routes/NoticeRoutes")
app.use("/notice",noticeRoutes)

const reviewRoutes = require("./src/routes/ReviewRoutes")
app.use("/review",reviewRoutes)

const PORT = process.env.PORT

app.listen(PORT,()=> {
    console.log(`server started on port ${PORT}`);
})