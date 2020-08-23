import React, { useEffect } from "react";
import Container from "../components/Container";
import NavBar from "../components/NavBar";
import { Formik, Form } from "formik";
import TextField from "../components/TextField";
import { Button } from "@chakra-ui/core";
import {
  useCreatePostMutation,
  useMeQuery,
} from "../graphql/generated/graphql";
import { withUrqlClient } from "next-urql";
import createUrqlClient from "../utils/createUrqlClient";
import { useRouter } from "next/router";
import useAuthenticated from "../utils/useAuthenticated";

const CreatePostPage = () => {
  const router = useRouter();

  const [, createPost] = useCreatePostMutation();

  useAuthenticated();

  return (
    <>
      <NavBar />
      <Container>
        <Formik
          initialValues={{ title: "", content: "" }}
          onSubmit={async (values) => {
            const { error } = await createPost({
              input: values,
            });

            if (!error) router.push("/");
          }}
        >
          {(props) => (
            <Form>
              <TextField
                name="title"
                label="Title"
                placeholder="How to become a programmer?"
              />
              <TextField
                name="content"
                label="Content"
                placeholder="1. Buy a computer&#10;2. Start programming"
                textarea
              />
              <Button
                mt={4}
                variantColor="teal"
                isLoading={props.isSubmitting}
                type="submit"
              >
                Create post
              </Button>
            </Form>
          )}
        </Formik>
      </Container>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePostPage);
