const passwordValidator = (res, password, fieldName) => {
  const passwordPattern = /^\S+$/;

  if (!password) {
    res.send({ error: "Password is required", errorField: fieldName });
    return true;
  } else if (!passwordPattern.test(password)) {
    res.send({ error: "Space is not allowed", errorField: fieldName });
    return true;
  } else {
    return false;
  }
};

module.exports = passwordValidator;
