import { FieldError } from "../gql/graphql";

export const toErrorMap = (errors: FieldError[]) => {
  const errorMap: Record<string, string> = {};
  console.log(errors);
  errors.forEach(({ field, message }) => {
    console.log(field);
    errorMap[field] = message;
  });

  return errorMap;
};
