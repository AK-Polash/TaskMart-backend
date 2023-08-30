const UserModel = require("../models/userModel");
const TaskModel = require("../models/taskModel");
const AssignedTaskModel = require("../models/assignedTaskModel");
const {
  emptySpaceValidation,
  noSpaceValidation,
} = require("../helpers/spaceValidator");
const { idValidator } = require("../helpers/idValidator");

const addTaskController = async (req, res) => {
  const { title, description, user } = req.body;

  if (emptySpaceValidation(res, title, "title")) {
    return;
  } else if (emptySpaceValidation(res, description, "description")) {
    return;
  } else if (idValidator(res, user)) {
    return;
  }

  try {
    const newTask = new TaskModel({
      title,
      description,
      user,
    });

    await newTask.save();
    await UserModel.findOneAndUpdate(
      { _id: user },
      { $push: { tasks: newTask._id } },
      { new: true }
    );

    return res.send({ message: "Task added successfully" });
  } catch (err) {
    console.log(err);
    return res.send({ error: "Internal server error" });
  }
};

const allTaskController = async (req, res) => {
  const { user } = req.headers;
  if (idValidator(res, user)) {
    return;
  }

  try {
    const allTask = await TaskModel.find({ user });
    if (!allTask.length > 0) {
      return res.send({ error: "No task added yet" });
    }

    return res.send({
      message: "Successfully received all tasks",
      data: allTask,
    });
  } catch (err) {
    console.log(err);
    return res.send({ error: "Internal server error" });
  }
};

const deleteTaskController = async (req, res) => {
  const { taskId, userId, deleteAs } = req.body;
  if (idValidator(res, taskId)) {
    return;
  } else if (idValidator(res, userId)) {
    return;
  } else if (noSpaceValidation(res, deleteAs, "")) {
    return;
  }

  try {
    // while Deleting both Own or Assign-To, Assign-By tasks:
    if (deleteAs === "normal" || deleteAs === "assigned") {
      const task = await TaskModel.findOneAndDelete(
        { _id: taskId },
        { new: true }
      );
      if (!task) return res.send({ error: "Task not found" });

      const user = await UserModel.findOneAndUpdate(
        { _id: userId },
        { $pull: { tasks: taskId } },
        { new: true }
      );
      if (!user) {
        return res.send({ error: "Action failed unfortunately" });
      }
    }

    // while Deleting only Assign-To, Assign-By tasks:
    if (deleteAs === "assigned") {
      const assignedTask = await AssignedTaskModel.findOneAndDelete(
        { task: taskId },
        { new: true }
      );
      if (!assignedTask) return res.send({ error: "Unexpected error occured" });
    }

    return res.send({ message: "Task deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.send({ error: "Internal server error" });
  }
};

const editTaskController = async (req, res) => {
  const { taskId, title, description } = req.body;

  if (idValidator(res, taskId)) {
    return;
  } else if (emptySpaceValidation(res, title, "title")) {
    return;
  } else if (emptySpaceValidation(res, description, "description")) {
    return;
  }

  try {
    const data = await TaskModel.findOneAndUpdate(
      { _id: taskId },
      { $set: { title, description } },
      { new: true }
    );

    if (!data) {
      return res.send({ error: "Task not found" });
    }

    return res.send({ message: "Task Updated successfully" });
  } catch (err) {
    console.log(err);
    return res.send({ error: "Internal server error" });
  }
};

const assignTaskController = async (req, res) => {
  const { whoAssigned, whomAssigned, task } = req.body;
  if (idValidator(res, whoAssigned)) {
    return;
  } else if (idValidator(res, whomAssigned)) {
    return;
  } else if (idValidator(res, task)) {
    return;
  }

  try {
    const assignTask = new AssignedTaskModel({
      whoAssigned,
      whomAssigned,
      task,
    });

    const duplicateTask = await AssignedTaskModel.findOne({ task });
    if (duplicateTask) {
      return res.send({ error: "This task already assigned once" });
    }

    const savedData = await assignTask.save();
    const { __v, ...rest } = savedData.toObject();

    return res.send({
      message: "Task assigned successfully",
      data: rest,
    });
  } catch (err) {
    console.log(err);
    return res.send({ error: "Internal server error" });
  }
};

const allAssingedTasksController = async (req, res) => {
  try {
    const allAssignedTasks = await AssignedTaskModel.find({})
      .select({ __v: 0 })
      .populate([
        {
          path: "whoAssigned",
          select: "-__v -password -verified -tasks -created",
        },
        {
          path: "whomAssigned",
          select: "-__v -password -verified -tasks -created",
        },
        { path: "task", select: "-__v" },
      ]);

    if (!allAssignedTasks.length > 0) {
      return res.send({ error: "No assigned task found" });
    }

    return res.send({ message: "Request successfull", data: allAssignedTasks });
  } catch (err) {
    console.log(err);
    return res.send({ error: "Internal server error" });
  }
};

const taskStatusController = async (req, res) => {
  const { taskId, status } = req.body;
  const noSpace = /^\S*$/;

  if (idValidator(res, taskId)) {
    return;
  } else if (!status === "Pending" || !status === "Completed") {
    return res.send({ error: "Wrong status provided" });
  } else if (!status) {
    return res.send({ error: "Status is missing" });
  } else if (!noSpace.test(status)) {
    return res.send({ error: "Invalid status" });
  }

  try {
    const existingTask = await TaskModel.findOneAndUpdate(
      { _id: taskId },
      { $set: { status } },
      { new: true }
    );
    if (!existingTask) return res.send({ error: "Task not found" });

    return res.send({ message: "Status updated successfully" });
  } catch (err) {
    console.log(err);
    return res.send({ error: "Internal server error" });
  }
};

module.exports = {
  addTaskController,
  allTaskController,
  deleteTaskController,
  editTaskController,
  assignTaskController,
  allAssingedTasksController,
  taskStatusController,
};
