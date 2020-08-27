import { Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import Container from "../components/Container";
import NavBar from "../components/NavBar";
import TextField from "../components/TextField";
import { useRegisterMutation } from "../graphql/generated/graphql";
import toErrorMap from "../utils/toErrorMap";

const RegisterPage = () => {
  const [register] = useRegisterMutation();

  const router = useRouter();

  return (
    <>
      <NavBar />
      <Container>
        <Formik
          initialValues={{
            username: "",
            password: "",
            repeatPassword: "",
            email: "",
          }}
          onSubmit={async (values, { setErrors }) => {
            if (values.password !== values.repeatPassword) {
              setErrors({ repeatPassword: "Passwords doesn't match" });
              return;
            }

            const res = await register({
              variables: {
                input: {
                  username: values.username,
                  password: values.password,
                  email: values.email,
                },
              },
            });

            if (res.data?.register.errors?.length) {
              const errors = toErrorMap(res.data.register.errors);
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
                name="email"
                label="Email"
                placeholder="john_wick@mail.com"
                type="email"
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
                Register
              </Button>
            </Form>
          )}
        </Formik>
      </Container>
    </>
  );
};

export default RegisterPage;
