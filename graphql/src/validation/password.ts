const passwordValidation = (password: string) => {
  const errors = [];

  if (password.length <= 2)
    errors.push({
      field: "password",
      message: "Length must be greater than 2",
    });

  return errors;
};

export default passwordValidation;
