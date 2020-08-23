import React, { useState } from "react";
import { Alert, AlertIcon } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import { Formik, Form } from "formik";
import { Button } from "@chakra-ui/core";
import Container from "../components/Container";
import TextField from "../components/TextField";
import { useForgotPasswordMutation } from "../graphql/generated/graphql";
import toErrorMap from "../utils/toErrorMap";
import createUrqlClient from "../utils/createUrqlClient";
import NavBar from "../components/NavBar";

const ForgotPasswordPage = () => {
  const [complete, setComplete] = useState(false);

  const [, forgotPassword] = useForgotPasswordMutation();

  return (
    <>
      <NavBar />
      <Container>
        {complete ? (
          <Alert status="success">
            <AlertIcon />
            Reset link has been sent
          </Alert>
        ) : (
          <Formik
            initialValues={{ usernameOrEmail: "" }}
            onSubmit={async (values, { setErrors }) => {
              const res = await forgotPassword(values);

              if (res.data?.forgotPassword.errors?.length) {
                const errors = toErrorMap(res.data.forgotPassword.errors);
                setErrors(errors);
                return;
              }

              setComplete(true);
            }}
          >
            {(props) => (
              <Form>
                <TextField
                  name="usernameOrEmail"
                  label="Username or Email"
                  placeholder="john_wick or john_wick@mail.com"
                />
                <Button
                  mt={4}
                  variantColor="teal"
                  isLoading={props.isSubmitting}
                  type="submit"
                >
                  Reset password
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </Container>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPasswordPage);
