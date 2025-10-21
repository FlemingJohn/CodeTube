
'use server';
/**
 * @fileOverview A flow for suggesting YouTube videos based on a study topic.
 *
 * - suggestVideos - A function that handles the video suggestion process.
 * - SuggestVideosInput - The input type for the function.
 * - SuggestVideosOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { youtubeSearch } from './youtube-search';

const SuggestVideosInputSchema = z.object({
  query: z.string().describe('The topic the user wants to learn about.'),
});
export type SuggestVideosInput = z.infer<typeof SuggestVideosInputSchema>;

const VideoSuggestionSchema = z.object({
  videoId: z.string().describe("The YouTube video's ID."),
  title: z.string().describe('The title of the YouTube video.'),
  channelTitle: z.string().describe("The YouTube channel's name."),
  thumbnailUrl: z.string().describe('The URL of the video thumbnail.'),
});

const SuggestVideosOutputSchema = z.object({
  videos: z
    .array(VideoSuggestionSchema)
    .describe('A list of 3-5 videos that are the best fit for the user query.'),
});
export type SuggestVideosOutput = z.infer<typeof SuggestVideosOutputSchema>;

const suggestVideosFlow = ai.defineFlow(
  {
    name: 'suggestVideosFlow',
    inputSchema: SuggestVideosInputSchema,
    outputSchema: SuggestVideosOutputSchema,
  },
  async ({ query }) => {
    // Step 1: Search YouTube for relevant videos.
    const searchResults = await youtubeSearch({ query });

    if (!searchResults.videos || searchResults.videos.length === 0) {
      throw new Error('No videos found on YouTube for this topic.');
    }

    // Prepare the video list for the categorization prompt.
    const videoListForPrompt = searchResults.videos
      .map(
        (v, i) =>
          `${i + 1}. Title: "${v.title}", Channel: "${
            v.channelTitle
          }", ID: ${v.id}`
      )
      .join('\n');

    const selectionPrompt = ai.definePrompt({
      name: 'selectBestVideosPrompt',
      output: { schema: z.object({
          videos: z.array(z.object({
              videoId: z.string().describe("The ID of the video."),
              title: z.string().describe("The title of the video."),
              channelTitle: z.string().describe("The channel of the video."),
          })).describe("An array of 3-5 video objects that are the best fit.")
      }) },
      prompt: `You are an expert curriculum developer and tech educator. You are helping a student who wants to learn about: "${query}".

You have been provided with a list of YouTube videos. Your task is to analyze this list and select the 3-5 most relevant, clear, and comprehensive videos. Prioritize videos from well-known, reputable channels.

Use the video titles and channel names to make your decision.

Here is the list of videos to categorize:
${videoListForPrompt}
`,
    });

    // Step 2: Use the AI to select the best videos.
    const { output } = await selectionPrompt();
    if (!output) {
      throw new Error('The AI failed to select videos.');
    }

    // Step 3: Map the original video details (like thumbnails) to the categorized output.
    const allSearchResults = new Map(
      searchResults.videos.map(v => [v.id, v])
    );

    const enrichedVideos = output.videos.map(suggestion => {
        const originalVideo = allSearchResults.get(suggestion.videoId);
        return {
            ...suggestion,
            thumbnailUrl: originalVideo?.thumbnail.replace('default.jpg', 'mqdefault.jpg') || '',
        };
    });

    return {
      videos: enrichedVideos,
    };
  }
);

export async function suggestVideos(
  input: SuggestVideosInput
): Promise<SuggestVideosOutput> {
  return suggestVideosFlow(input);
}
