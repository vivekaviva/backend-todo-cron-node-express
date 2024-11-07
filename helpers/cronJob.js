const cron = require("node-cron");
const Todo = require("../models/TodoModel");
const common = require("../helpers/common");
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

      const completedTodos = []; // To hold the completed todos after email

      for (const todo of dueTodos) {
        const subject = `Reminder: Your TODO is due in 10 minutes!`;

        // Send email and wait for it to finish before proceeding
        await sendEmail(todo.userEmail, subject, todo);
        console.log(`Sent reminder email for TODO: ${todo.title}`);

        // Update the task status to 'completed'
        const updatedTodo = await Todo.findByIdAndUpdate(
          todo._id,
          {
            status: "completed",
            reminderSent: true, // Set reminderSent to true to avoid sending multiple emails
          },
          { new: true }
        ); // Return the updated document

        // Add the updated todo to the completedTodos array
        completedTodos.push(updatedTodo);
      }

      // Log completed todos
      console.log("Completed Todos:", completedTodos);

      // You can send this array as a response or log it
      // Example: Sending the completedTodos array as part of the response
      const response = {
        message: "Success! Completed todos updated",
        completed: completedTodos,
      };

      // Assuming you have an API endpoint to return this
      // Send response, or modify it as needed.
      // Here, you can send the response back to the client if required
      return common.sendResponse(response, req, res);
    } catch (error) {
      console.error("Error checking for due todos:", error);
    }
  });
};

module.exports = cronJob;
