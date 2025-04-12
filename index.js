const express = require("express");
const { connectDatabase } = require("./config/database");
const app = express();
const propertyRoute = require("./routes/property");
const ownerAuthRoute = require("./routes/ownerAuth");
const roomRoute = require("./routes/room");
const tenantRoute = require("./routes/tenant");
const paymentRoute = require("./routes/payment");
const { cornJob } = require("./utils/utils");

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

const { CronJob } = require("cron");

const job = new CronJob(
  "0 0 1 * * *", // At 1:00 AM (hours, minutes, seconds)
  () => {
    console.log("Running job at 1 AM IST");
    cornJob();
  },
  null,
  true,
  "Asia/Kolkata" // Timezone
);

job.start();

app.listen(8800, async () => {
  console.log("Server is running at 8800");
});
