import React from "react";
import Container from "../../../components/Container";
import NavBar from "../../../components/NavBar";
import { Formik, Form } from "formik";
import TextField from "../../../components/TextField";
import { Button, Spinner } from "@chakra-ui/core";
import { useUpdatePostMutation } from "../../../graphql/generated/graphql";
import { withUrqlClient } from "next-urql";
import createUrqlClient from "../../../utils/createUrqlClient";
import ErrorPage from "next/error";
import usePostFromUrl from "../../../hooks/usePostFromUrl";
import { useRouter } from "next/router";

const EditPostPage = () => {
  const [, updatePost] = useUpdatePostMutation();

  const { data, fetching } = usePostFromUrl();

  const router = useRouter();

  if (fetching) return <Spinner />;

  if (!data) return <ErrorPage statusCode={404} />;

  return (
    <>
      <NavBar />
      <Container>
        <Formik
          initialValues={{ title: data.title, content: data.content }}
          onSubmit={async (values) => {
            await updatePost({
              input: { ...values, id: data.id },
            });

            router.back();
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
                Update post
              </Button>
            </Form>
          )}
        </Formik>
      </Container>
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(EditPostPage);
