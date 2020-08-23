import { Text, Spinner } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import createUrqlClient from "../utils/createUrqlClient";
import { usePostsQuery } from "../graphql/generated/graphql";
import NavBar from "../components/NavBar";

const IndexPage = () => {
  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: 10,
    },
  });

  if (fetching) return <Spinner />;

  return (
    <>
      <NavBar />
      {data?.posts.map((post) => (
        <Text key={post.id}>{post.title}</Text>
      ))}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(IndexPage);
