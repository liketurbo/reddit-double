import React from "react";
import { withUrqlClient } from "next-urql";
import createUrqlClient from "../../utils/createUrqlClient";
import { useRouter } from "next/router";
import { usePostQuery } from "../../graphql/generated/graphql";
import ErrorPage from "next/error";
import { Text, Heading, Box, Spinner } from "@chakra-ui/core";
import NavBar from "../../components/NavBar";
import usePostFromUrl from "../../hooks/usePostFromUrl";

const PostPage = () => {
  const { data, fetching } = usePostFromUrl();

  if (fetching) return <Spinner />;

  if (!data) return <ErrorPage statusCode={404} />;

  return (
    <>
      <NavBar />
      <Box m={8}>
        <Heading>{data.title}</Heading>
        <Text>{data.content}</Text>
      </Box>
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(PostPage);
