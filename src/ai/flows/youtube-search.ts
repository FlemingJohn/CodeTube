'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const YoutubeSearchInputSchema = z.object({
  query: z.string().describe('The query to search for on YouTube.'),
});
export type YoutubeSearchInput = z.infer<typeof YoutubeSearchInputSchema>;

const YoutubeSearchOutputSchema = z.object({
  videos: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      thumbnail: z.string(),
      channelTitle: z.string(),
    })
  ),
});
export type YoutubeSearchOutput = z.infer<typeof YoutubeSearchOutputSchema>;

export async function youtubeSearch(
  input: YoutubeSearchInput
): Promise<YoutubeSearchOutput> {
  return youtubeSearchFlow(input);
}

const youtubeSearchFlow = ai.defineFlow(
  {
    name: 'youtubeSearchFlow',
    inputSchema: YoutubeSearchInputSchema,
    outputSchema: YoutubeSearchOutputSchema,
  },
  async ({ query }) => {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YouTube API key is not configured.');
    }

    // Use dynamic import to fix constructor issue with Turbopack
    const Youtube = (await import('youtube-v3-api'));

    const api = new Youtube(apiKey);
    const response = await api.search(query, {
      part: 'snippet',
      type: 'video',
      maxResults: 10,
    });

    const videos = response.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.default.url,
      channelTitle: item.snippet.channelTitle,
    }));

    return { videos };
  }
);
