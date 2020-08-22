const usernameOrEmailValidation = (username: string) => {
  const errors = [];

  if (username.length <= 2)
    errors.push({
      field: "usernameOrEmail",
      message: "Length must be greater than 2",
    });

  return errors;
};

export default usernameOrEmailValidation;
