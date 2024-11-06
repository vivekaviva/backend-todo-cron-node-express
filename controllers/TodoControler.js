const Todo = require("../models/TodoModel");
const common = require("../helpers/common");
const io = require("../index").io; // Import io for socket notifications

const getTodos = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const todos = await Todo.find().skip(skip).limit(limit);

    const message = "Success! All Todo fetched";
    // return res.json(todos);

    return common.sendResponse(todos, req, res, message);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch TODOs");
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
    res.json(todo);
  } catch (error) {
    console.error("Error creating TODO:", error);
    res.status(500).json({ error: "Failed to update TODO" });
  }
};

const deleteTodos = async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    const io = req.app.get("io");
    io.emit("todoDeleted", req.params.id); // Notify clients of the deletion
    res.json({ message: "TODO deleted" });
  } catch (error) {
    console.error("Error creating TODO:", error);
    res.status(500).json({ error: "Failed to delete TODO" });
  }
};

module.exports = { getTodos, createTodos, updateTodos, deleteTodos };
