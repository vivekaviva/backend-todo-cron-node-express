const express = require("express");

const router = express.Router();
const todoController = require("../controllers/TodoControler");

router.get("/", (req, res) => {
  res.send("Welcome");
});

router.get("/todos", todoController.getTodos);
router.post("/todos", todoController.createTodos);
router.put("/todos/:id", todoController.updateTodos);
router.delete("/todos/:id", todoController.deleteTodos);

module.exports = router;
