import { Flex, FlexProps, Icon, PseudoBox } from "@chakra-ui/core";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useRemovePostMutation } from "../graphql/generated/graphql";

const ControlButtons = ({ id, ...rest }: ControlButtonsProps) => {
  const router = useRouter();
  const [removePost] = useRemovePostMutation();

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
          removePost({ variables: { id } });
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
