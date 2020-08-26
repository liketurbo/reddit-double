import React from "react";
import { withUrqlClient } from "next-urql";
import createUrqlClient from "../../utils/createUrqlClient";
import { useRouter } from "next/router";
import { usePostQuery } from "../../graphql/generated/graphql";
import ErrorPage from "next/error";
import { Text, Heading, Box, Spinner } from "@chakra-ui/core";
import NavBar from "../../components/NavBar";

const PostPage = () => {
  const router = useRouter();

  if (!router.query.id) return <ErrorPage statusCode={404} />;

  const [{ data, fetching }] = usePostQuery({
    variables: { id: +router.query.id },
  });

  if (fetching) return <Spinner />;

  if (!data || !data.post) return <ErrorPage statusCode={404} />;

  return (
    <>
      <NavBar />
      <Box m={8}>
        <Heading>{data.post.title}</Heading>
        <Text>{data.post.content}</Text>
      </Box>
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(PostPage);
