import { Box, Heading, Spinner, Text } from "@chakra-ui/core";
import ErrorPage from "next/error";
import React from "react";
import ControlButtons from "../../components/ControlButtons";
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
        <ControlButtons id={data.id} mb={5} />
        <Heading>{data.title}</Heading>
        <Text>{data.content}</Text>
      </Box>
    </>
  );
};

export default PostPage;
