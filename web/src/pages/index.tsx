import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Link as ChakraLink,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/core";
import ErrorPage from "next/error";
import Link from "next/link";
import ControlButtons from "../components/ControlButtons";
import NavBar from "../components/NavBar";
import Updoot from "../components/Updoot";
import { useMeQuery, usePostsQuery } from "../graphql/generated/graphql";
import withApollo from "../utils/withApollo";

const IndexPage = () => {
  const {
    data: postsData,
    loading,
    error,
    fetchMore,
    variables,
  } = usePostsQuery({
    variables: {
      limit: 10,
      cursor: null as string | null,
    },
    notifyOnNetworkStatusChange: true,
  });

  const { data: meData } = useMeQuery();

  if (!postsData && loading) return <Spinner />;

  if (!postsData) return <ErrorPage statusCode={500} title={error?.message} />;

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
          <Link href="/post/create" passHref>
            <ChakraLink ml="auto" color="teal.500">
              Create post
            </ChakraLink>
          </Link>
        </Flex>
        <Divider m={0} />
      </Box>
      <Stack m={8} spacing={8}>
        {postsData.posts.posts
          .filter((post) => post)
          .map((post) => (
            <Flex p={5} shadow="md" borderWidth="1px" key={post.id}>
              <Flex>
                <Updoot post={post} mr={5} />
              </Flex>
              <Box flex={1} minWidth={0}>
                <Flex justify="space-between" alignItems="center">
                  <Link href="/post/[id]" as={`/post/${post.id}`} passHref>
                    <ChakraLink minWidth={0} color="teal.500">
                      <Heading isTruncated fontSize="xl">
                        {post.title}
                      </Heading>
                    </ChakraLink>
                  </Link>
                  {meData?.me.user?.id === post.creator.id && (
                    <ControlButtons id={post.id} ml={5} />
                  )}
                </Flex>
                <Flex>
                  <Text>Posted by </Text>
                  <Text ml={1} as="u">
                    {post.creator.username}
                  </Text>
                </Flex>
                <Text mt={4}>{post.contentSnippet}</Text>
              </Box>
            </Flex>
          ))}
      </Stack>
      {postsData.posts.hasMore && (
        <Flex justify="center" mb={16}>
          <Button
            onClick={() => {
              const { posts } = postsData.posts;

              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor: posts[posts.length - 1].createdAt,
                },
              });
            }}
            isLoading={loading}
          >
            Load more
          </Button>
        </Flex>
      )}
    </>
  );
};

export default withApollo({ ssr: true })(IndexPage);
