const emailValidation = (email: string) => {
  const errors = [];

  if (!/\S+@\S+\.\S+/.test(email))
    errors.push({
      field: "email",
      message: "Invalid email address",
    });

  return errors;
};

export default emailValidation;
