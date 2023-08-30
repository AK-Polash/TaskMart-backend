const mongoose = require("mongoose");

const idValidator = (res, name) => {
  if (!name) {
    res.send({ error: "Reference error occured" });
    return true;
  } else if (!mongoose.Types.ObjectId.isValid(name)) {
    res.send({ error: "Unexpected error occured" });
    return true;
  } else {
    return false;
  }
};

module.exports = { idValidator };
