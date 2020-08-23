import {
  useMeQuery,
  useCreatePostMutation,
} from "../graphql/generated/graphql";
import { useEffect } from "react";
import { useRouter } from "next/router";

const useAuthenticated = () => {
  const router = useRouter();

  const [{ data, fetching }] = useMeQuery();
  const [, createPost] = useCreatePostMutation();

  useEffect(() => {
    if (!data?.me.user && !fetching) router.replace("/login");
  }, [data, fetching, router]);
};

export default useAuthenticated;
