import React from "react";
import { Flex, PseudoBox, Icon, FlexProps } from "@chakra-ui/core";
import Link from "next/link";
import { useRemovePostMutation } from "../graphql/generated/graphql";
import { useRouter } from "next/router";
import { route } from "next/dist/next-server/server/router";

const ControlButtons = ({ id, ...rest }: ControlButtonsProps) => {
  const router = useRouter();
  const [, removePost] = useRemovePostMutation();

  return (
    <Flex {...rest}>
      <Link href="/post/[id]/edit" as={`/post/${id}/edit`} passHref>
        <PseudoBox cursor="pointer" _hover={{ color: "teal.500" }}>
          <Icon name="edit" />
        </PseudoBox>
      </Link>
      <PseudoBox
        ml={2}
        cursor="pointer"
        _hover={{ color: "red.500" }}
        onClick={() => {
          removePost({ id });
          router.push("/");
        }}
      >
        <Icon name="delete" />
      </PseudoBox>
    </Flex>
  );
};

export interface ControlButtonsProps extends Omit<FlexProps, "id"> {
  id: number;
}

export default ControlButtons;
