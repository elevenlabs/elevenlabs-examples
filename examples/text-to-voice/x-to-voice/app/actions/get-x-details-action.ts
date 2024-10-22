"use server";

import { actionClient } from "@/app/actions/safe-action";
import { ApifyClient } from "apify-client";
import { z } from "zod";

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

const getXDetailsSchema = z.object({
  handle: z.string(),
});

export const getXDetailsAction = actionClient
  .schema(getXDetailsSchema)
  .action(async ({ parsedInput: { handle } }) => {
    const input = {
      handles: [handle],
      tweetsDesired: 100,
      proxyConfig: {
        useApifyProxy: true,
      },
    };

    try {
      const run = await client.actor("quacker/twitter-scraper").call(input);
      console.log("Results from dataset");
      console.log(
        `💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`
      );
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      items.forEach(item => {
        console.dir(item);
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Unknown error");
    }
  });
