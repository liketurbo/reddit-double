import { Box, Heading, Spinner, Text } from "@chakra-ui/core";
import ErrorPage from "next/error";
import React from "react";
import ControlButtons from "../../components/ControlButtons";
import NavBar from "../../components/NavBar";
import usePostFromUrl from "../../hooks/usePostFromUrl";
import withApollo from "../../utils/withApollo";
import { useMeQuery } from "../../graphql/generated/graphql";

const PostPage = () => {
  const { data: postData, loading: postLoading } = usePostFromUrl();

  const { data: meData, loading: meLoading } = useMeQuery();

  if (postLoading || meLoading) return <Spinner />;

  if (!postData || !meData) return <ErrorPage statusCode={404} />;

  return (
    <>
      <NavBar />
      <Box m={8}>
        {postData.creator.id === meData.me.user?.id && (
          <ControlButtons id={postData.id} mb={5} />
        )}
        <Heading>{postData.title}</Heading>
        <Text>{postData.content}</Text>
      </Box>
    </>
  );
};

export default withApollo({ ssr: true })(PostPage);
