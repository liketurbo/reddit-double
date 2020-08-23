const passwordValidation = (password: string, field: string = "password") => {
  const errors = [];

  if (password.length <= 2)
    errors.push({
      field,
      message: "Length must be greater than 2",
    });

  return errors;
};

export default passwordValidation;
