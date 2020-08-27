import { useMeQuery } from "../graphql/generated/graphql";
import { useEffect } from "react";
import { useRouter } from "next/router";

const useAuthenticated = () => {
  const router = useRouter();

  const { data, loading } = useMeQuery();

  useEffect(() => {
    if (!data?.me.user && !loading) {
      const url = new URL("/login", window.location.origin);
      url.searchParams.append("next", router.pathname);

      router.replace(url);
    }
  }, [data, loading, router]);
};

export default useAuthenticated;
