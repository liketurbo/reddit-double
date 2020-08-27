import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  CloseButton,
  Link as ChakraLink,
} from "@chakra-ui/core";
import { Form, Formik } from "formik";
import ErrorPage from "next/error";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Container from "../../components/Container";
import NavBar from "../../components/NavBar";
import TextField from "../../components/TextField";
import { useChangePasswordMutation } from "../../graphql/generated/graphql";
import toErrorMap from "../../utils/toErrorMap";

const ChangePasswordPage = () => {
  const [changePassword] = useChangePasswordMutation();

  const router = useRouter();

  const [tokenError, setTokenError] = useState("");

  const token = router.query.token === "string" ? router.query.token : "";

  if (!token) return <ErrorPage statusCode={404} />;

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
              variables: {
                input: {
                  newPassword: values.newPassword,
                  token,
                },
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

export default ChangePasswordPage;
