const express = require("express");
const {
  addTaskController,
  allTaskController,
  deleteTaskController,
  editTaskController,
  assignTaskController,
  allAssingedTasksController,
  taskStatusController,
} = require("../../controllers/taskControllers");
const _ = express.Router();

_.post("/addTask", addTaskController);
_.get("/allTask", allTaskController);
_.post("/deleteTask", deleteTaskController);
_.post("/editTask", editTaskController);
_.post("/assignTask", assignTaskController);
_.get("/allAssignedTask", allAssingedTasksController);
_.post("/updateTaskStatus", taskStatusController);

module.exports = _;
