const express = require("express");
const { connectDatabase } = require("./config/database");
const app = express();
const propertyRoute = require("./routes/property");
const ownerAuthRoute = require("./routes/ownerAuth");
const roomRoute = require("./routes/room");
const tenantRoute = require("./routes/tenant");
const paymentRoute = require("./routes/payment");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
app.use(express.json());

connectDatabase();

app.use("/properties", propertyRoute);
app.use("/owner/auth", ownerAuthRoute);
app.use("/room", roomRoute);
app.use("/tenant", tenantRoute);
app.use("/payment", paymentRoute);

app.listen(8800, () => {
  console.log("Server is running at 8800");
});
