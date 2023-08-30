const mongoose = require("mongoose");
const { Schema } = mongoose;

const assignTaskSchema = new Schema({
  whoAssigned: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  whomAssigned: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  task: {
    type: Schema.Types.ObjectId,
    ref: "Task",
  },

  assignedOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AssignedTask", assignTaskSchema);
