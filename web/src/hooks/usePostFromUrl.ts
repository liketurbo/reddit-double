import { useRouter } from "next/router";
import { usePostQuery } from "../graphql/generated/graphql";

const usePostFromUrl = () => {
  const router = useRouter();

  if (typeof router.query.id !== "string")
    return {
      data: null,
      fetching: false,
      error: { message: "Post's id not provided" },
    };

  const [{ data, fetching }] = usePostQuery({
    variables: { id: +router.query.id },
  });

  if (fetching) return { data: null, fetching: true, error: null };

  if (data && data.post)
    return { data: data.post, fetching: false, error: null };
  else
    return {
      data: null,
      fetching: false,
      error: { message: "Post does not exist" },
    };
};

export default usePostFromUrl;
