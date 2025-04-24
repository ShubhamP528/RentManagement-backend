const { connectDatabase } = require("../config/database");
const { cornJob } = require("../utils/utils");

connectDatabase();

module.exports = async (req, res) => {
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
