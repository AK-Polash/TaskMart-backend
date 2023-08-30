const noSpaceValidation = (res, name, fieldName) => {
  const noSpace = /^\S*$/;

  if (!name) {
    res.send({ error: `${fieldName} is required`, errorField: fieldName });
    return true;
  } else if (!noSpace.test(name)) {
    res.send({ error: `Valid ${fieldName} required`, errorField: fieldName });
    return true;
  } else {
    return false;
  }
};

const emptySpaceValidation = (res, name, fieldName) => {
  const emptySpace = /\S+/;

  if (!name) {
    res.send({ error: `${fieldName} is required`, errorField: fieldName });
    return true;
  } else if (!emptySpace.test(name)) {
    res.send({ error: `Valid ${fieldName} required`, errorField: fieldName });
    return true;
  } else {
    return false;
  }
};

module.exports = { noSpaceValidation, emptySpaceValidation };
