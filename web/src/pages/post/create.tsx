import { Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import Container from "../../components/Container";
import NavBar from "../../components/NavBar";
import TextField from "../../components/TextField";
import {
  useCreatePostMutation,
  CreatePostMutation,
} from "../../graphql/generated/graphql";
import useAuthenticated from "../../hooks/useAuthenticated";
import withApollo from "../../utils/withApollo";
import { ApolloCache } from "@apollo/client";

const updateAfterCreatePost = (cache: ApolloCache<CreatePostMutation>) => {
  cache.evict({ fieldName: "posts" });
};

const CreatePostPage = () => {
  const router = useRouter();

  const [createPost] = useCreatePostMutation();

  useAuthenticated();

  return (
    <>
      <NavBar />
      <Container>
        <Formik
          initialValues={{ title: "", content: "" }}
          onSubmit={async (values) => {
            const { errors } = await createPost({
              variables: {
                input: values,
              },
              update: updateAfterCreatePost,
            });

            if (!errors?.length) router.push("/");
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

export default withApollo({ ssr: true })(CreatePostPage);
