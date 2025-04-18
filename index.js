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

// const { CronJob } = require("cron");

// const job = new CronJob(
//   "0 0 1 * * *", // At 1:00 AM (hours, minutes, seconds)
//   () => {
//     console.log("Running job at 1 AM IST");
//     cornJob();
//   },
//   null,
//   true,
//   "Asia/Kolkata" // Timezone
// );

// job.start();

// This handler is used for scheduled (cron) tasks on Vercel.
// This is our serverless function handler which will be used by Vercel for cron jobs or API requests.
const handler = async (req, res) => {
  try {
    console.log("Cron job triggered!");
    await cornJob();
    res.status(200).json({ message: "Cron job ran successfully!" });
  } catch (error) {
    console.error("Error executing cron job:", error);
    res
      .status(500)
      .json({ error: "An error occurred during cron job execution." });
  }
};

// Export the handler as the default export for Vercel
module.exports = handler;

// Only start the standalone Express server when not running in the Vercel environment
if (!process.env.VERCEL_ENV) {
  app.listen(8800, () => {
    console.log("Server is running on port 8800");
  });
}

// exports.handler = async (req, res) => {
//   // Your periodic task logic here
//   console.log("Cron job triggered!");
//   await cornJob();
//   // Do something like call an API, update DB, etc.
//   res.status(200).json({ message: "Cron job ran successfully!" });
// };

// app.listen(8800, async () => {
//   console.log("Server is running at 8800");
// });
