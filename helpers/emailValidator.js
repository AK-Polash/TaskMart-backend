const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailValidator = (res, email, fieldName) => {
  if (!email) {
    res.send({ error: "Email is required", errorField: fieldName });
    return true;
  } else if (!emailPattern.test(email)) {
    res.send({ error: "Valid email required", errorField: fieldName });
    return true;
  } else {
    return false;
  }
};

module.exports = emailValidator;
