const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const supportEmail = process.env.SUPPORT_EMAIL;

const sendEmail = async (to, templateId, dynamicData, subject) => {
  const msg = {
    to,
    from: supportEmail,
    templateId,
    dynamic_template_data: dynamicData,
  };

  console.log("Sending email with data:", dynamicData); // log

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.response?.body || error.message);
    throw new Error("Failed to send email");
  }
};

module.exports = {
  sendEmail,
};
