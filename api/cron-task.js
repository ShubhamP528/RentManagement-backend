import { cornJob } from "../utils/utils";

export default async function handler(req, res) {
  // Your periodic task logic here
  console.log("Cron job triggered!");
  await cornJob();
  // Do something like call an API, update DB, etc.
  res.status(200).json({ message: "Cron job ran successfully!" });
}
