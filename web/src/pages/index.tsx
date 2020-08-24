import {
  Text,
  Spinner,
  Stack,
  Box,
  Heading,
  Flex,
  Divider,
} from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import createUrqlClient from "../utils/createUrqlClient";
import { usePostsQuery } from "../graphql/generated/graphql";
import NavBar from "../components/NavBar";
import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/core";
import Link from "next/link";
import { Link as ChakraLink } from "@chakra-ui/core";
import ErrorPage from "next/error";
import { useState } from "react";

const IndexPage = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as string | null,
  });

  const [{ data, fetching, error }] = usePostsQuery({
    variables,
  });

  if (!data && fetching) return <Spinner />;

  if (!data) return <ErrorPage statusCode={500} title={error?.message} />;

  return (
    <>
      <NavBar />
      <Text bg="black" color="white" textAlign="center">
        We're now lunched 🎉.{" "}
        <ChakraLink color="teal.500">Learn more</ChakraLink> about purpose of
        this site
      </Text>
      <Box bg="white" position="sticky" top="56px">
        <Flex py={4} px={8} alignItems="center">
          <Menu>
            <MenuButton as={Button} {...{ rightIcon: "chevron-down" }}>
              Sort
            </MenuButton>
            <MenuList>
              <MenuItem>Desc date</MenuItem>
              <MenuItem>Acs date</MenuItem>
            </MenuList>
          </Menu>
          <Link href="/create-post" passHref>
            <ChakraLink ml="auto" color="teal.500">
              Create post
            </ChakraLink>
          </Link>
        </Flex>
        <Divider m={0} />
      </Box>
      <Stack m={8} spacing={8}>
        {data.posts.posts.map((post) => (
          <Box p={5} shadow="md" borderWidth="1px" key={post.id}>
            <Heading isTruncated fontSize="xl">
              {post.title}
            </Heading>
            <Flex>
              <Text>Posted by </Text>
              <Text ml={1} as="u">
                {post.creator.username}
              </Text>
            </Flex>
            <Text mt={4}>{post.contentSnippet}</Text>
          </Box>
        ))}
      </Stack>
      {data.posts.hasMore && (
        <Flex justify="center" mb={16}>
          <Button
            onClick={() =>
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
            isLoading={fetching}
          >
            Load more
          </Button>
        </Flex>
      )}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(IndexPage);
