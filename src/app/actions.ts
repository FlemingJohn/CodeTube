'use server';

import { generateChapterSummary } from '@/ai/flows/generate-chapter-summary';
import { suggestLandingPageImprovements } from '@/ai/flows/suggest-landing-page-improvements';
import { Chapter } from '@/lib/types';
import { z } from 'zod';

const generateSummarySchema = z.object({
  transcript: z.string(),
});

export async function handleGenerateSummary(values: z.infer<typeof generateSummarySchema>) {
  const validatedFields = generateSummarySchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const result = await generateChapterSummary({ transcript: validatedFields.data.transcript });
    return { summary: result.summary };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate summary. Please try again.' };
  }
}

const suggestImprovementsSchema = z.object({
  htmlContent: z.string(),
});

export async function handleSuggestImprovements(values: z.infer<typeof suggestImprovementsSchema>) {
  const validatedFields = suggestImprovementsSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }
  
  if (!validatedFields.data.htmlContent) {
    return { error: 'Landing page content cannot be empty.' };
  }

  try {
    const result = await suggestLandingPageImprovements({ landingPageContent: validatedFields.data.htmlContent });
    return { suggestions: result.suggestions };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate suggestions. Please try again.' };
  }
}

export async function getYoutubeChapters(videoId: string): Promise<{ chapters?: Chapter[], error?: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/youtube-chapters?videoId=${videoId}`);
    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to fetch chapters from YouTube API.' };
    }
    const data = await response.json();
    return { chapters: data.chapters };
  } catch (error) {
    console.error('Error fetching youtube chapters:', error);
    return { error: 'An unexpected error occurred.' };
  }
}
