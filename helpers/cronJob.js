// backend/helpers/cronJob.js
const cron = require("node-cron");
const Todo = require("../models/TodoModel");
const sendEmail = require("../config/mailer");

const cronJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);

      const dueTodos = await Todo.find({
        dueDate: { $lte: tenMinutesFromNow, $gt: now },
        status: { $ne: "completed" },
        reminderSent: false,
      });

      dueTodos.forEach(async (todo) => {
        const subject = `Reminder: Your TODO is due in 10 minutes!`;
        await sendEmail(todo.userEmail, subject, todo);
        console.log(`Sent reminder email for TODO: ${todo.title}`);

        await Todo.findByIdAndUpdate(todo._id, { reminderSent: true });
      });
    } catch (error) {
      console.error("Error checking for due todos:", error);
    }
  });
};

module.exports = cronJob;
