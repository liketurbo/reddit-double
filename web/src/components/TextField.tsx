import React from "react";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
} from "@chakra-ui/core";
import { useField, FieldHookConfig } from "formik";

const TextField = ({ label, textarea, ...props }: TextFieldProps) => {
  const [field, meta] = useField(props);

  return (
    <FormControl isInvalid={Boolean(meta.error) && meta.touched}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      {textarea ? (
        <Textarea
          {...(props as any)}
          {...field}
          id={field.name}
          placeholder={props.placeholder}
        />
      ) : (
        <Input
          {...(props as any)}
          {...field}
          id={field.name}
          placeholder={props.placeholder}
        />
      )}
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
};

export type TextFieldProps = {
  label: string;
  textarea?: boolean;
} & FieldHookConfig<any>;

export default TextField;
