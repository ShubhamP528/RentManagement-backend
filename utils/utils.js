const Payment = require("../models/Payment");
const Tenant = require("../models/Tenant");

const getCompletedMonths = (endDateStr) => {
  let currentDate;
  if (process.env.NODE_ENV === "production") {
    const cuurDate = new Date();
    // Get the UTC time in milliseconds
    const utc = cuurDate.getTime() + cuurDate.getTimezoneOffset() * 60000;

    // IST offset is +5:30 or 19800000 milliseconds
    currentDate = new Date(utc + 5.5 * 60 * 60 * 1000); // <-- don't re-declare with 'const'
  } else {
    currentDate = new Date();
  }

  const startDate = new Date(endDateStr);
  const endDate = currentDate;

  let yearsDiff = endDate.getFullYear() - startDate.getFullYear();
  let monthsDiff = endDate.getMonth() - startDate.getMonth();
  let totalMonths = yearsDiff * 12 + monthsDiff;

  // Check if the end date's day is before the start date's day in the month
  if (endDate.getDate() < startDate.getDate()) {
    totalMonths -= 1; // Not a full month completed
  }

  return totalMonths >= 0 ? totalMonths : 0;
};

const cornJob = async () => {
  const getAllExistingTenants = await Tenant.find({ endDate: null });

  getAllExistingTenants.forEach(async (tenant) => {
    const totalMonths = getCompletedMonths(tenant.startDate);

    console.log("Start Date:", tenant.startDate);

    console.log("Total Months:", totalMonths);

    const totalRent = tenant.Rent * totalMonths;

    const totalPayments = await Payment.find({ tenant: tenant._id });

    const totalPaidRent = totalPayments.reduce((acc, payment) => {
      return acc + payment.RoomRent;
    }, 0);

    const totalPayableRent = totalRent - totalPaidRent;
    const partialPendingMoney = totalPayableRent - 0;

    if (partialPendingMoney > 0) {
      tenant.PendingMoney = partialPendingMoney;
      tenant.AdvanceMoney = 0;
    } else {
      tenant.AdvanceMoney = partialPendingMoney * -1;
      tenant.PendingMoney = 0;
    }
  });
};

module.exports = {
  getCompletedMonths,
  cornJob,
};
