import React from "react";
import { Formik, Form } from "formik";
import { Button } from "@chakra-ui/core";
import Container from "../../components/Container";
import TextField from "../../components/TextField";
import { useLoginMutation } from "../graphql/generated/graphql";
import toErrorMap from "../utils/toErrorMap";
import { useRouter } from "next/router";

const LoginPage = () => {
  const [, login] = useLoginMutation();

  const router = useRouter();

  return (
    <Container>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const res = await login({
            input: values,
          });

          if (res.data?.login.errors?.length) {
            const errors = toErrorMap(res.data.login.errors);
            setErrors(errors);
            return;
          }

          router.push("/");
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
            <Button
              mt={4}
              variantColor="teal"
              isLoading={props.isSubmitting}
              type="submit"
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default LoginPage;
