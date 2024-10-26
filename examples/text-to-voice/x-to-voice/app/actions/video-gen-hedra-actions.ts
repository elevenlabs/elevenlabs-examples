// WIP
// const HEDRA_BASE_URL = "https://mercury.dev.dream-ai.com/api";

// interface VideoGenerationStatus {
//   status: "pending" | "processing" | "completed" | "failed";
//   jobId?: string;
//   videoUrl?: string;
//   error?: string;
//   timestamp: string;
// }

// interface HedraResponse {
//   jobId: string;
//   status: string;
//   videoUrl?: string;
//   error?: string;
// }

// interface ActionResponse {
//   success: boolean;
//   videoUrl?: string;
//   status?: VideoGenerationStatus;
//   error?: string;
// }

// export const generateHumanVideoAction = actionClient
//   .schema(synthesizeRetrieveHumanSchema)
//   .action(
//     async ({
//       parsedInput: { handle: inputHandle },
//     }): Promise<ActionResponse> => {
//       const handle = normalizeHandle(inputHandle);

//       try {
//         console.info(`[TTV-X] Starting video generation for handle: ${handle}`);

//         // Check if video already exists
//         const existingVideo = await kv.get<string>(`ttv_x_video:${handle}`);
//         if (existingVideo) {
//           console.info(`[TTV-X] Existing video found for ${handle}`);
//           return {
//             success: true,
//             videoUrl: existingVideo,
//           };
//         }

//         // // Check if generation is already in progress
//         // const generationStatus = await kv.get<VideoGenerationStatus>(
//         //   `ttv_x_video_status:${handle}`
//         // );
//         // if (generationStatus) {
//         //   console.info(`[TTV-X] Generation already in progress for ${handle}`);
//         //   return {
//         //     success: true,
//         //     status: generationStatus,
//         //   };
//         // }

//         // Get the human specimen data
//         const humanSpecimen = (await kv.get(`ttv_x:${handle}`)) as any;
//         if (!humanSpecimen) {
//           throw new Error("User data not found");
//         }

//         // uplooad audio:
//         const audioResponse = await fetch(`${HEDRA_BASE_URL}/audio`, {
//           method: "POST",
//           headers: {
//             "X-API-KEY": env.HEDRA_API_KEY,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(body),
//         });
//         const audioData = await audioResponse.json();

//         // Set initial status
//         const initialStatus: VideoGenerationStatus = {
//           status: "pending",
//           timestamp: new Date().toISOString(),
//         };
//         await kv.set(`ttv_x_video_status:${handle}`, initialStatus);

//         console.info(`[TTV-X] Initiating Hedra API request for ${handle}`);

//         const body = {
//           voiceUrl: humanSpecimen?.voicePreviews[0],
//           avatarImage:
//             humanSpecimen?.user?.profilePicture.replace(
//               /_normal(?=\.\w+$)/,
//               ""
//             ) ?? "",

//           audioSource: "audio",
//         };
//         console.log(body);
//         // Start video generation
//         const response = await fetch(`${HEDRA_BASE_URL}/v1/characters`, {
//           method: "POST",
//           headers: {
//             "X-API-KEY": env.HEDRA_API_KEY,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(body),
//         });

//         console.log(response, "from hedra");
//         if (!response.ok) {
//           throw new Error(`Hedra API error: ${response}`);
//         }

//         const data = (await response.json()) as HedraResponse;

//         if (!data.jobId) {
//           throw new Error("No job ID received from Hedra API");
//         }

//         const jobId = data.jobId;
//         console.info(
//           `[TTV-X] Hedra job created with ID: ${jobId} for ${handle}`
//         );

//         // Update status to processing
//         const processingStatus: VideoGenerationStatus = {
//           status: "processing",
//           jobId,
//           timestamp: new Date().toISOString(),
//         };
//         await kv.set(`ttv_x_video_status:${handle}`, processingStatus);

//         // Poll for completion
//         await pollVideoGeneration(handle, jobId);

//         const finalStatus = await kv.get<VideoGenerationStatus>(
//           `ttv_x_video_status:${handle}`
//         );
//         return {
//           success: true,
//           status: finalStatus,
//         };
//       } catch (error) {
//         console.error(`[TTV-X] Error generating video for ${handle}:`, error);

//         // Update status to failed
//         const failedStatus: VideoGenerationStatus = {
//           status: "failed",
//           error: error instanceof Error ? error.message : "Unknown error",
//           timestamp: new Date().toISOString(),
//         };
//         await kv.set(`ttv_x_video_status:${handle}`, failedStatus);

//         return {
//           success: false,
//           error: "Failed to generate human video.",
//         };
//       }
//     }
//   );

// async function pollVideoGeneration(
//   handle: string,
//   jobId: string
// ): Promise<void> {
//   const maxAttempts = 30; // 5 minutes with 10-second intervals
//   let attempts = 0;

//   const pollInterval = setInterval(async () => {
//     try {
//       attempts++;
//       console.info(`[TTV-X] Polling attempt ${attempts} for ${handle}`);

//       const response = await fetch(`${HEDRA_BASE_URL}/v1/projects/${jobId}`, {
//         headers: {
//           "X-API-KEY": env.HEDRA_API_KEY,
//         },
//       });

//       if (!response.ok) {
//         throw new Error(
//           `Hedra API error: ${response.status} ${response.statusText}`
//         );
//       }

//       const data = (await response.json()) as HedraResponse;

//       if (data.status === "completed" && data.videoUrl) {
//         clearInterval(pollInterval);
//         console.info(`[TTV-X] Video generation completed for ${handle}`);

//         // Download the video
//         const videoResponse = await fetch(data.videoUrl);
//         if (!videoResponse.ok) {
//           throw new Error("Failed to download generated video");
//         }

//         // Convert to blob and upload to Blob storage
//         const videoBlob = await videoResponse.blob();
//         const { url } = await put(
//           `videos/${handle}-${Date.now()}.mp4`,
//           videoBlob,
//           {
//             access: "public",
//             contentType: "video/mp4",
//           }
//         );

//         // Store the final video URL
//         await kv.set(`ttv_x_video:${handle}`, url);

//         // Update status to completed
//         const completedStatus: VideoGenerationStatus = {
//           status: "completed",
//           videoUrl: url,
//           timestamp: new Date().toISOString(),
//         };
//         await kv.set(`ttv_x_video_status:${handle}`, completedStatus);
//       } else if (data.status === "failed") {
//         clearInterval(pollInterval);
//         const failedStatus: VideoGenerationStatus = {
//           status: "failed",
//           error: data.error || "Unknown error",
//           timestamp: new Date().toISOString(),
//         };
//         await kv.set(`ttv_x_video_status:${handle}`, failedStatus);
//         throw new Error(
//           `Video generation failed: ${data.error || "Unknown error"}`
//         );
//       }

//       if (attempts >= maxAttempts) {
//         clearInterval(pollInterval);
//         const timeoutStatus: VideoGenerationStatus = {
//           status: "failed",
//           error: "Video generation timed out",
//           timestamp: new Date().toISOString(),
//         };
//         await kv.set(`ttv_x_video_status:${handle}`, timeoutStatus);
//         throw new Error("Video generation timed out");
//       }
//     } catch (error) {
//       clearInterval(pollInterval);
//       console.error(
//         `[TTV-X] Error polling video generation for ${handle}:`,
//         error
//       );
//       throw error;
//     }
//   }, 10000); // Poll every 10 seconds
// }
