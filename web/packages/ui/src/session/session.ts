import { ApiProblem, getGetMeQueryKey, getMe, type MeResponse, useSignOut as useSignOutMutation } from '@carenest/api-client';
import { queryOptions, useQueryClient, useSuspenseQuery, type QueryClient } from '@tanstack/react-query';

export const roles = {
  parent: 'parent',
  consultant: 'consultant',
  admin: 'admin',
} as const;

export type Role = (typeof roles)[keyof typeof roles];

// Shares the generated cache key, so useGetMe and generated invalidations see the same entry.
export const meQuery = queryOptions({
  queryKey: getGetMeQueryKey(),
  queryFn: ({ signal }) => getMe({ signal }),
});

export function hasRole(me: MeResponse, role: Role): boolean {
  return me.roles.includes(role);
}

// Route guards call this: null means "not signed in", any other failure is a real error.
export async function loadSession(queryClient: QueryClient): Promise<MeResponse | null> {
  try {
    return await queryClient.ensureQueryData(meQuery);
  } catch (error) {
    if (error instanceof ApiProblem && error.status === 401) {
      return null;
    }

    throw error;
  }
}

// Only for components under a guarded route, where loadSession has already filled the cache.
export function useMe(): MeResponse {
  return useSuspenseQuery(meQuery).data;
}

// Called on every sign-in, link, sign-out and deletion: a new session must never see the previous user's cached data.
export async function resetSession(queryClient: QueryClient): Promise<void> {
  await queryClient.cancelQueries();
  queryClient.clear();
}

export function useSignOut(onSignedOut: () => void) {
  const queryClient = useQueryClient();
  return useSignOutMutation({
    mutation: {
      onSettled: async () => {
        await resetSession(queryClient);
        onSignedOut();
      },
    },
  });
}
