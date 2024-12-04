import {
    DEFAULT_SERVER_ERROR_MESSAGE,
    createSafeActionClient,
  } from "next-safe-action";
  import { headers } from "next/headers";
  
  export const actionClient = createSafeActionClient({
    handleServerError(e) {
      if (e instanceof Error) {
        return e.message;
      }
  
      return DEFAULT_SERVER_ERROR_MESSAGE;
    },
  }).use(async ({ next }) => {
    // forward the user's ip address to context (for rate limiting)
    const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
    return next({ ctx: { ip } });
  });
  