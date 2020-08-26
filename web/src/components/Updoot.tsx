import React, { useState } from "react";
import {
  Flex,
  PseudoBox,
  Icon,
  Text,
  FlexProps,
  Spinner,
} from "@chakra-ui/core";
import { PostFragment, useVoteMutation } from "../graphql/generated/graphql";

const Updoot = ({ post, ...rest }: UpdootProps & FlexProps) => {
  const [{ fetching }, vote] = useVoteMutation();
  const [select, setSelect] = useState<-1 | 1>(-1);

  return (
    <Flex direction="column" alignItems="center" justify="center" {...rest}>
      {select === 1 && fetching ? (
        <Spinner />
      ) : (
        <PseudoBox
          onClick={() => {
            if (post.voteStatus === 1) return;

            setSelect(1);
            vote({ postId: post.id, value: 1 });
          }}
          color={post.voteStatus === 1 ? "black" : "gray.400"}
          cursor={post.voteStatus === 1 ? "default" : "pointer"}
          _hover={post.voteStatus === 1 ? undefined : { color: "tomato" }}
        >
          <Icon name="chevron-up" size="24px" />
        </PseudoBox>
      )}
      <Text>{post.points}</Text>
      {select === -1 && fetching ? (
        <Spinner />
      ) : (
        <PseudoBox
          onClick={() => {
            if (post.voteStatus === -1) return;

            setSelect(-1);
            vote({ postId: post.id, value: -1 });
          }}
          color={post.voteStatus === -1 ? "black" : "gray.400"}
          cursor={post.voteStatus === -1 ? "default" : "pointer"}
          _hover={post.voteStatus === -1 ? undefined : { color: "tomato" }}
        >
          <Icon name="chevron-down" size="24px" />
        </PseudoBox>
      )}
    </Flex>
  );
};

export interface UpdootProps {
  post: PostFragment;
}

export default Updoot;
