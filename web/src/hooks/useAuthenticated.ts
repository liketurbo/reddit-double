import { useMeQuery } from "../graphql/generated/graphql";
import { useEffect } from "react";
import { useRouter } from "next/router";

const useAuthenticated = () => {
  const router = useRouter();

  const [{ data, fetching }] = useMeQuery();

  useEffect(() => {
    if (!data?.me.user && !fetching) {
      const url = new URL("/login", window.location.origin);
      url.searchParams.append("next", router.pathname);

      router.replace(url);
    }
  }, [data, fetching, router]);
};

export default useAuthenticated;
