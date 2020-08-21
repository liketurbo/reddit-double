const usernameValidation = (username: string) => {
  const errors = [];

  if (!/^[0-9a-zA-Z_.-]+$/.test(username))
    errors.push({
      field: "username",
      message:
        "Only can contain letters (a-z), numbers (0-9), underscore (_), dash (-) and periods (.)",
    });

  if (username.length <= 2)
    errors.push({
      field: "username",
      message: "Length must be greater than 2",
    });

  return errors;
};

export default usernameValidation;
