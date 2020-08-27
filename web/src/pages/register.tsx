import { Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import Container from "../components/Container";
import NavBar from "../components/NavBar";
import TextField from "../components/TextField";
import {
  useRegisterMutation,
  RegisterMutation,
  MeDocument,
} from "../graphql/generated/graphql";
import toErrorMap from "../utils/toErrorMap";
import withApollo from "../utils/withApollo";
import { ApolloCache, FetchResult } from "@apollo/client";

const updateAfterRegister = (
  cache: ApolloCache<RegisterMutation>,
  fetchResult: FetchResult<RegisterMutation>
) => {
  if (!fetchResult.data?.register.user) return;

  cache.writeQuery({
    query: MeDocument,
    data: {
      __typename: "Query",
      me: fetchResult.data.register.user,
    },
  });
};

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
              update: updateAfterRegister,
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

export default withApollo({ ssr: true })(RegisterPage);
