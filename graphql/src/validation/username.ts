const usernameValidation = (username: string) => {
  const errors = [];

  if (!/^[0-9a-zA-Z_.-]+$/.test(username))
    errors.push({ field: "username", message: "Invalid characters" });

  if (username.length <= 2)
    errors.push({
      field: "username",
      message: "Length must be greater than 2",
    });

  return errors;
};

export default usernameValidation;
