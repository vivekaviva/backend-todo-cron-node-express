const Todo = require("../models/TodoModel");
const common = require("../helpers/common");
const io = require("../index").io; // Import io for socket notifications

const getTodos = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Fetch todos with pagination first
    const todos = await Todo.find();
    // const todos = await Todo.find().skip(skip).limit(limit);

    // Log todos to check the status field
    console.log(todos);

    // Separate pending and completed todos using proper case-insensitive filtering
    const pendingTodos = todos.filter(
      (todo) => (todo.status || "").toLowerCase() !== "completed"
    );
    const completedTodos = todos.filter(
      (todo) => (todo.status || "").toLowerCase() === "completed"
    );

    // Log to check if the todos are being separated correctly
    console.log("Pending Todos:", pendingTodos);
    console.log("Completed Todos:", completedTodos);

    // Prepare response with separated pending and completed todos
    const response = {
      message: "Success! Todos fetched",
      pending: pendingTodos,
      completed: completedTodos,
    };

    return common.sendResponse(response, req, res);
  } catch (err) {
    console.error("Error fetching TODOs:", err);
    res.status(500).send("Failed to fetch TODOs");
  }
};

const getSingleTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const message = "Success! Todo fetched";
    return common.sendResponse(todo, req, res, message);
  } catch (err) {
    console.error("Error fetching TODO:", err);
    res.status(500).json({ error: "Failed to fetch TODO" });
  }
};
const createTodos = async (req, res) => {
  try {
    const todo = new Todo({
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate,
      status: req.body.status,
      image: req.body.image,
      userEmail: req.body.userEmail,
    });
    await todo.save();

    const io = req.app.get("io");
    io.emit("todoAdded", todo);

    res.status(201).json(todo);
  } catch (error) {
    console.error("Error creating TODO:", error);
    res.status(500).json({ error: "Failed to create TODO" });
  }
};

const updateTodos = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    const io = req.app.get("io");
    io.emit("todoUpdated", todo); // Notify clients of the update
    // res.json(todo);
    const message = "Success! Todo updated";
    return common.sendResponse(todo, req, res, message);
  } catch (error) {
    console.error("Error creating TODO:", error);
    res.status(500).json({ error: "Failed to update TODO" });
  }
};

const deleteTodos = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    const io = req.app.get("io");
    io.emit("todoDeleted", req.params.id); // Notify clients of the deletion
    // res.json({ message: "TODO deleted" });
    const message = "Success! Todo deleted";
    return common.sendResponse(todo, req, res, message);
  } catch (error) {
    console.error("Error creating TODO:", error);
    res.status(500).json({ error: "Failed to delete TODO" });
  }
};

module.exports = {
  getTodos,
  createTodos,
  updateTodos,
  deleteTodos,
  getSingleTodo,
};
