import {
  Avatar,
  Button,
  Divider,
  Flex,
  Link as ChakraLink,
  Spinner,
  Text,
} from "@chakra-ui/core";
import Link from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../graphql/generated/graphql";

const NavBar = () => {
  const [logout, { loading: logoutFetching, client }] = useLogoutMutation();

  const { data, loading } = useMeQuery();

  let body = null;

  if (loading) body = <Spinner ml="auto" />;
  else if (!data?.me.user)
    body = (
      <>
        <Link href="/login" passHref>
          <ChakraLink ml="auto" mr={2}>
            Login
          </ChakraLink>
        </Link>
        <Link href="/register" passHref>
          <ChakraLink>Register</ChakraLink>
        </Link>
      </>
    );
  else
    body = (
      <Flex ml="auto">
        <Avatar
          size="xs"
          mr={2}
          name="Dan Abrahmov"
          src="https://bit.ly/dan-abramov"
        />
        <Text lineHeight={1.25}>{data.me.user.username}</Text>
        <Divider orientation="vertical" />
        <Button
          isLoading={logoutFetching}
          onClick={async () => {
            await logout();
            await client.resetStore();
          }}
          size="xs"
        >
          Logout
        </Button>
      </Flex>
    );

  return (
    <Flex position="sticky" top={0} zIndex={1} bg="tomato" p={4}>
      <Link href="/" passHref>
        <ChakraLink>Home</ChakraLink>
      </Link>
      {body}
    </Flex>
  );
};

export default NavBar;
