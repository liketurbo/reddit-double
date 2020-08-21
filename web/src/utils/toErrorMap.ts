import { FieldError } from "../graphql/generated/graphql";

const toErrorMap = (errors: FieldError[]) => {
  const errorMap: { [key: string]: string } = Object.create(null);

  errors.forEach(({ field, message }) => {
    errorMap[field] = message;
  });

  return errorMap;
};

export default toErrorMap;
