"use server";

import { actionClient } from "@/app/actions/safe-action";
import { z } from "zod";
import { TwitterApi } from "twitter-api-v2";

const getXDetailsSchema = z.object({
  handle: z.string(),
});

export const getXDetailsAction = actionClient
  .schema(getXDetailsSchema)
  .action(async ({ parsedInput: { handle } }) => {
    try {
      const twitterClient = new TwitterApi(
        process.env.TWITTER_BEARER_TOKEN || ""
      );
      const readOnlyClient = twitterClient.readOnly;
      // wait for 4 seoncds]
      await new Promise(resolve => setTimeout(resolve, 4000));
      const response = await readOnlyClient.v2.userByUsername(handle, {
        "user.fields": [
          "description",
          "location",
          "profile_image_url",
          "public_metrics",
        ],
      });

      console.log(response);
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error");
    }
  });
