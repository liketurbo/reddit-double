import React from "react";
import { Formik, Field, Form } from "formik";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
} from "@chakra-ui/core";
import Container from "../../components/Container";
import TextField from "../../components/TextField";
import { useMutation } from "urql";
import { REGISTER_MUTATION } from "../mutations";

const RegisterPage = () => {
  const [, register] = useMutation(REGISTER_MUTATION);

  return (
    <Container>
      <Formik
        initialValues={{ username: "", password: "", repeatPassword: "" }}
        onSubmit={(values) => {
          return register({
            input: { username: values.username, password: values.password },
          });
        }}
      >
        {(props) => (
          <Form>
            <TextField
              name="username"
              label="Username"
              placeholder="john_wick"
            />
            <TextField
              name="password"
              label="Password"
              placeholder="*********"
              type="password"
            />
            <TextField
              name="repeatPassword"
              label="Repeat password"
              placeholder="*********"
              type="password"
            />
            <Button
              mt={4}
              variantColor="teal"
              isLoading={props.isSubmitting}
              type="submit"
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default RegisterPage;
