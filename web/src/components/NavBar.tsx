import React from "react";
import {
  Flex,
  Link as ChakraLink,
  Spinner,
  Avatar,
  Text,
  Button,
  Divider,
} from "@chakra-ui/core";
import Link from "next/link";
import { useMeQuery, useLogoutMutation } from "../graphql/generated/graphql";
import { useRouter } from "next/router";

const NavBar = () => {
  const router = useRouter();

  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  const [{ data, fetching }] = useMeQuery();

  let body = null;

  if (fetching) body = <Spinner ml="auto" />;
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
            router.reload();
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
