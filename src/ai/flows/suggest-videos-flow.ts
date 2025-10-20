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
  justification: z
    .string()
    .describe(
      'A brief, one-sentence justification for why this video was recommended for its category.'
    ),
});

const SuggestVideosOutputSchema = z.object({
  highlyRecommended: z
    .array(VideoSuggestionSchema)
    .describe(
      'A list of 2-3 videos that are the best fit for the user query.'
    ),
  recommended: z
    .array(VideoSuggestionSchema)
    .describe(
      'A list of 2-3 alternative videos that are also good fits.'
    ),
  optional: z
    .array(VideoSuggestionSchema)
    .describe(
      'A list of 1-2 videos that are related but might be more advanced, specific, or tangentially related.'
    ),
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
          `${i + 1}. Title: "${v.title}", Channel: "${v.channelTitle}", ID: ${
            v.id
          }`
      )
      .join('\n');

    const categorizationPrompt = ai.definePrompt({
      name: 'categorizeVideosPrompt',
      output: { schema: SuggestVideosOutputSchema },
      prompt: `You are an expert curriculum developer and tech educator. You are helping a student who wants to learn about: "${query}".

You have been provided with a list of YouTube videos. Your task is to analyze this list and categorize them into three groups: "Highly Recommended", "Recommended", and "Optional".

- **Highly Recommended**: These should be the most relevant, clear, and comprehensive introductory videos. Prioritize videos from well-known, reputable channels. Aim for 2-3 videos.
- **Recommended**: These are good alternatives, perhaps covering the same topic from a different angle or with a slightly different focus. Aim for 2-3 videos.
- **Optional**: These could be more advanced, specific case studies, or related topics that the student might find interesting after mastering the basics. Aim for 1-2 videos.

For each video you select, you MUST provide a brief, one-sentence justification explaining *why* it belongs in that category.

Use the video titles and channel names to make your decision.

Here is the list of videos to categorize:
${videoListForPrompt}
`,
    });

    // Step 2: Use the AI to categorize the search results.
    const { output } = await categorizationPrompt();
    if (!output) {
      throw new Error('The AI failed to categorize the videos.');
    }

    // Step 3: Map the original video details (like thumbnails) to the categorized output.
    const allSearchResults = new Map(
      searchResults.videos.map(v => [v.id, v])
    );

    const enrich = (suggestion: z.infer<typeof VideoSuggestionSchema>) => {
      const originalVideo = allSearchResults.get(suggestion.videoId);
      return {
        ...suggestion,
        title: originalVideo?.title || suggestion.title,
        channelTitle: originalVideo?.channelTitle || suggestion.channelTitle,
        thumbnailUrl:
          originalVideo?.thumbnail.replace('default.jpg', 'mqdefault.jpg') ||
          '',
      };
    };

    return {
      highlyRecommended: output.highlyRecommended.map(enrich),
      recommended: output.recommended.map(enrich),
      optional: output.optional.map(enrich),
    };
  }
);

export async function suggestVideos(
  input: SuggestVideosInput
): Promise<SuggestVideosOutput> {
  return suggestVideosFlow(input);
}
