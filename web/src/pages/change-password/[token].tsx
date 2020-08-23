import React, { useState } from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import Container from "../../components/Container";
import TextField from "../../components/TextField";
import { useChangePasswordMutation } from "../../graphql/generated/graphql";
import toErrorMap from "../../utils/toErrorMap";
import createUrqlClient from "../../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import NavBar from "../../components/NavBar";
import ErrorPage from "next/error";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/core";
import { CloseButton } from "@chakra-ui/core";
import Link from "next/link";
import { Button, Link as ChakraLink } from "@chakra-ui/core";

const ChangePasswordPage = () => {
  const [, changePassword] = useChangePasswordMutation();

  const router = useRouter();

  const [tokenError, setTokenError] = useState("");

  const token = router.query.token;

  if (typeof token !== "string") return <ErrorPage statusCode={404} />;

  return (
    <>
      <NavBar />
      <Container>
        <Formik
          initialValues={{
            newPassword: "",
            repeatNewPassword: "",
          }}
          onSubmit={async (values, { setErrors }) => {
            setTokenError("");

            if (values.newPassword !== values.repeatNewPassword) {
              setErrors({ repeatNewPassword: "Passwords doesn't match" });
              return;
            }

            const res = await changePassword({
              input: {
                newPassword: values.newPassword,
                token,
              },
            });

            if (res.data?.changePassword.errors?.length) {
              const errors = toErrorMap(res.data.changePassword.errors);

              if ("token" in errors) setTokenError(errors["token"]);

              setErrors(errors);
              return;
            }

            router.push("/");
          }}
        >
          {(props) => (
            <Form>
              <TextField
                name="newPassword"
                label="New Password"
                placeholder="*********"
                type="password"
              />
              <TextField
                name="repeatNewPassword"
                label="Repeat new password"
                placeholder="*********"
                type="password"
              />
              <Button
                mt={4}
                variantColor="teal"
                isLoading={props.isSubmitting}
                type="submit"
              >
                Change password
              </Button>
            </Form>
          )}
        </Formik>
        {tokenError && (
          <Alert mt={4} status="error">
            <AlertIcon />
            <AlertTitle mr={2}>{tokenError}</AlertTitle>
            <AlertDescription>
              <Link href="/forgot-password" passHref>
                <ChakraLink color="teal.500">Click to get a new one</ChakraLink>
              </Link>
            </AlertDescription>
            <CloseButton
              onClick={() => setTokenError("")}
              position="absolute"
              right={2}
              top={2}
            />
          </Alert>
        )}
      </Container>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(ChangePasswordPage);
