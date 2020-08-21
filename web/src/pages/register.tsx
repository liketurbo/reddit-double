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

const RegisterPage = () => (
  <Container>
    <Formik
      initialValues={{ username: "", password: "" }}
      onSubmit={(values, actions) => {
        console.log(values);
        actions.setSubmitting(false);
      }}
    >
      {(props) => (
        <Form>
          <TextField name="username" label="Username" placeholder="john_wick" />
          <TextField
            name="password"
            label="Password"
            placeholder="*********"
            type="password"
          />
          <TextField
            name="password-repeat"
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

export default RegisterPage;
