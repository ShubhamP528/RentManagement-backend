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

  for (const tenant of getAllExistingTenants) {
    const totalMonths = getCompletedMonths(tenant.startDate);
    console.log("Start Date:", tenant.startDate);
    console.log("Total Months:", totalMonths);

    const totalRent = tenant.Rent * totalMonths;
    console.log("Total rent: ", totalRent);

    const totalPayments = await Payment.find({ tenant: tenant._id });
    console.log(totalPayments);

    const totalPaidRent = totalPayments.reduce((acc, payment) => {
      return acc + payment.RoomRent;
    }, 0);

    const totalPayableRent = totalRent - totalPaidRent;
    const partialPendingMoney = totalPayableRent;

    if (partialPendingMoney > 0) {
      tenant.PendingMoney = partialPendingMoney;
      tenant.AdvanceMoney = 0;
    } else {
      tenant.AdvanceMoney = -partialPendingMoney;
      tenant.PendingMoney = 0;
    }

    await tenant.save(); // Assuming you want to save the updated tenant.
  }
};

const nodemailer = require("nodemailer");

const sendPaymentEmail = async ({
  to,
  tenantName,
  roomNumber,
  DOP,
  MOP,
  RoomRent,
  Bill,
  totalAmount,
  previousReading,
  currentReading,
  finalReading,
}) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or use SMTP details
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your email password or app password
      },
    });
    DOP = new Date(DOP).toISOString().split("T")[0];

    // HTML content from your template
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <table width="600" cellpadding="20" cellspacing="0" style="background: #ffffff; border-radius: 8px;">
          <tr><td align="center"><h2>Payment Confirmation</h2></td></tr>
          <tr><td>
            <p>Dear <strong>${tenantName}</strong>,</p>
            <p>Thank you for your payment. Here are the details:</p>
            <table width="100%" cellpadding="10" cellspacing="0" style="background: #f9f9f9; border: 1px solid #ddd; border-radius: 6px;">
              <tr><td><strong>Room:</strong></td><td>${roomNumber}</td></tr>
              <tr><td><strong>Date of Payment:</strong></td><td>${DOP}</td></tr>
              <tr><td><strong>Month of Payment:</strong></td><td>${MOP}</td></tr>
              <tr><td><strong>Room Rent:</strong></td><td>₹${RoomRent}</td></tr>
              <tr><td><strong>Electricity Bill:</strong></td><td>₹${Bill}</td></tr>
              <tr><td><strong>Total Paid:</strong></td><td><strong>₹${totalAmount}</strong></td></tr>
              <tr><td><strong>Previous Reading:</strong></td><td>${previousReading}</td></tr>
              <tr><td><strong>Current Reading:</strong></td><td>${currentReading}</td></tr>
              <tr><td><strong>Final Reading:</strong></td><td>${finalReading}</td></tr>
            </table>
            <p>If you have any questions, please contact us.</p>
            <p>– Your Property Management Team</p>
          </td></tr>
          <tr><td align="center" style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} Property Management</td></tr>
        </table>
      </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: `"Property Management" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Payment Confirmation",
      html,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Payment confirmation email sent to", to);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendPaymentEmail;

module.exports = {
  getCompletedMonths,
  cornJob,
  sendPaymentEmail,
};
