import { queryClient } from "@/lib/hono-rpc-client";

import { authClient } from "./better-auth-client";

export const sessionQueryKey = ["session"];

export const getSession = async () =>
  await queryClient.fetchQuery({
    queryFn: () => authClient.getSession(),
    queryKey: sessionQueryKey,
    staleTime: 1000 * 60 * 5
  });

export const signOut = async () => {
  await authClient.signOut();
  await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
};
