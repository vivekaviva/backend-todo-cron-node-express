const cron = require("node-cron");
const Todo = require("../models/TodoModel");
const sendEmail = require("../config/mailer");

const cronJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);

      // Find todos due in the next 10 minutes that haven't been completed or reminded
      const dueTodos = await Todo.find({
        dueDate: { $lte: tenMinutesFromNow, $gt: now },
        status: { $ne: "completed" },
        reminderSent: false,
      });

      const completedTodos = [];

      for (const todo of dueTodos) {
        const subject = `Reminder: Your TODO is due in 10 minutes!`;

        // Send email
        await sendEmail(todo.userEmail, subject, todo);
        console.log(`Sent reminder email for TODO: ${todo.title}`);

        // Update the todo status and reminderSent flag
        const updatedTodo = await Todo.findByIdAndUpdate(
          todo._id,
          {
            status: "completed",
            reminderSent: true,
          },
          { new: true }
        );

        completedTodos.push(updatedTodo);
      }

      // Log completed todos
      // console.log("Completed Todos:", completedTodos);
    } catch (error) {
      console.error("Error checking for due todos:", error);
    }
  });
};

module.exports = cronJob;
