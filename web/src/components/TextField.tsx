import React from "react";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from "@chakra-ui/core";
import { useField, FieldHookConfig } from "formik";

const TextField = ({ label, ...props }: TextFieldProps) => {
  const [field, meta] = useField(props);

  return (
    <FormControl isInvalid={Boolean(meta.error) && meta.touched}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input
        {...(props as any)}
        {...field}
        id={field.name}
        placeholder={props.placeholder}
      />
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
};

export type TextFieldProps = {
  label: string;
} & FieldHookConfig<any>;

export default TextField;
