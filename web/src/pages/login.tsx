import { Box, Button, Link as ChakraLink } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import Container from "../components/Container";
import NavBar from "../components/NavBar";
import TextField from "../components/TextField";
import { useLoginMutation } from "../graphql/generated/graphql";
import toErrorMap from "../utils/toErrorMap";

const LoginPage = () => {
  const [login] = useLoginMutation();

  const router = useRouter();

  return (
    <>
      <NavBar />
      <Container>
        <Formik
          initialValues={{ usernameOrEmail: "", password: "" }}
          onSubmit={async (values, { setErrors }) => {
            const res = await login({
              variables: {
                input: values,
              },
            });

            if (res.data?.login.errors?.length) {
              const errors = toErrorMap(res.data.login.errors);
              setErrors(errors);
              return;
            }

            router.push(
              typeof router.query.next === "string" ? router.query.next : "/"
            );
          }}
        >
          {(props) => (
            <Form>
              <TextField
                name="usernameOrEmail"
                label="Username or Email"
                placeholder="john_wick or john_wick@mail.com"
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
              <Box mt={2}>
                <Link href="/forgot-password" passHref>
                  <ChakraLink color="teal.500">Forgot password?</ChakraLink>
                </Link>
              </Box>
            </Form>
          )}
        </Formik>
      </Container>
    </>
  );
};

export default LoginPage;
