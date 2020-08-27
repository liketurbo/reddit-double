import { useRouter } from "next/router";
import { usePostQuery } from "../graphql/generated/graphql";

const usePostFromUrl = () => {
  const router = useRouter();

  if (typeof router.query.id !== "string")
    return {
      data: null,
      loading: false,
      error: { message: "Post's id not provided" },
    };

  const { data, loading } = usePostQuery({
    variables: { id: +router.query.id },
  });

  if (loading) return { data: null, loading: true, error: null };

  if (data && data.post)
    return { data: data.post, loading: false, error: null };
  else
    return {
      data: null,
      loading: false,
      error: { message: "Post does not exist" },
    };
};

export default usePostFromUrl;
