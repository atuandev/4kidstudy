import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during SSR and hydration, true once rendering on the client. */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
