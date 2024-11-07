const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, todo) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TODO Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; }
        .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; }
        .header { background-color: #4CAF50; color: #ffffff; padding: 20px; text-align: center; font-size: 24px; }
        .content { padding: 20px; }
        .content h2 { color: #4CAF50; }
        .button { display: inline-block; margin-top: 20px; padding: 10px 20px; color: #ffffff !important; background-color: #4CAF50; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; color: #777; font-size: 14px; padding: 10px; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">TODO Reminder</div>
        <div class="content">
          <h2>Hi,</h2>
          <p>This is a reminder that your TODO item is due soon.</p>
          <p><strong>Task:</strong> ${todo.title || "No Title"}</p>
          <p><strong>Description:</strong> ${
            todo.description || "No Description"
          }</p>
          <p><strong>Due Date:</strong> ${new Date(
            todo.dueDate
          ).toLocaleString()}</p>
          <a href="${todo.link || "#"}" class="button">View Task</a>
          <p>If you've already completed this task, you can disregard this message.</p>
        </div>
        <div class="footer">Thank you for using our TODO application!</div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
