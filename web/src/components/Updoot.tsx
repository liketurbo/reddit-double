import React, { useState } from "react";
import {
  Flex,
  PseudoBox,
  Icon,
  Text,
  FlexProps,
  Spinner,
} from "@chakra-ui/core";
import {
  PostFragment,
  useVoteMutation,
  VoteMutation,
} from "../graphql/generated/graphql";
import gql from "graphql-tag";
import { ApolloCache } from "@apollo/client";

const updateAfterVote = (
  { postId, value }: { postId: number; value: number },
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment({
    fragment: gql`
      fragment _Post on Post {
        points
        voteStatus
      }
    `,
    id: "Post:" + postId,
  });

  const { points, voteStatus } = (data as any) as {
    points: number;
    voteStatus: number | null;
  };

  cache.writeFragment({
    fragment: gql`
      fragment _Post on Post {
        points
        voteStatus
      }
    `,
    id: "Post:" + postId,
    data: {
      points: points + (voteStatus ? 2 : 1) * value,
      voteStatus: value,
    },
  });
};

const Updoot = ({ post, ...rest }: UpdootProps & FlexProps) => {
  const [vote, { loading }] = useVoteMutation();
  const [select, setSelect] = useState<-1 | 1>(-1);

  return (
    <Flex direction="column" alignItems="center" justify="center" {...rest}>
      {select === 1 && loading ? (
        <Spinner />
      ) : (
        <PseudoBox
          onClick={() => {
            const value = 1;

            if (post.voteStatus === value) return;

            setSelect(value);

            vote({
              variables: { postId: post.id, value },
              update: (cache) =>
                updateAfterVote({ postId: post.id, value }, cache),
            });
          }}
          color={post.voteStatus === 1 ? "black" : "gray.400"}
          cursor={post.voteStatus === 1 ? "default" : "pointer"}
          _hover={post.voteStatus === 1 ? undefined : { color: "tomato" }}
        >
          <Icon name="chevron-up" size="24px" />
        </PseudoBox>
      )}
      <Text>{post.points}</Text>
      {select === -1 && loading ? (
        <Spinner />
      ) : (
        <PseudoBox
          onClick={() => {
            const value = -1;

            if (post.voteStatus === value) return;

            setSelect(value);

            vote({
              variables: { postId: post.id, value },
              update: (cache) =>
                updateAfterVote({ postId: post.id, value }, cache),
            });
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
