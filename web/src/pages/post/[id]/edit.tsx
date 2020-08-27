import { Button, Spinner } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import ErrorPage from "next/error";
import { useRouter } from "next/router";
import React from "react";
import Container from "../../../components/Container";
import NavBar from "../../../components/NavBar";
import TextField from "../../../components/TextField";
import { useUpdatePostMutation } from "../../../graphql/generated/graphql";
import usePostFromUrl from "../../../hooks/usePostFromUrl";
import withApollo from "../../../utils/withApollo";

const EditPostPage = () => {
  const [updatePost] = useUpdatePostMutation();

  const { data, loading: fetching } = usePostFromUrl();

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
              variables: {
                input: { ...values, id: data.id },
              },
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

export default withApollo({ ssr: true })(EditPostPage);
