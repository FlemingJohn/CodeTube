
'use server';

/**
 * @fileOverview This file is deprecated and will be removed. 
 * The logic has been moved to process-chapters.ts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChapterInfoSchema = z.object({
  id: z.string().describe('The unique identifier for the chapter.'),
  title: z.string().describe('The title of the chapter.'),
});

const FindCodeInTranscriptInputSchema = z.object({
  transcript: z.string().describe('The full video transcript and description text.'),
  chapters: z.array(ChapterInfoSchema).describe('An array of chapters to find code for.'),
});
export type FindCodeInTranscriptInput = z.infer<
  typeof FindCodeInTranscriptInputSchema
>;

const ChapterCodeSchema = z.object({
    chapterId: z.string().describe('The ID of the chapter this code belongs to.'),
    code: z.string().describe('The most relevant code snippet for this chapter. Return only the code. If no code is found, return an empty string.'),
});

const FindCodeInTranscriptOutputSchema = z.object({
  chapterCodeSnippets: z.array(ChapterCodeSchema).describe('An array of objects, each containing a chapter ID and its corresponding code snippet.'),
});
export type FindCodeInTranscriptOutput = z.infer<
  typeof FindCodeInTranscriptOutputSchema
>;

export async function findCodeInTranscript(
  input: FindCodeInTranscriptInput
): Promise<FindCodeInTranscriptOutput> {
  // This is deprecated.
  return Promise.resolve({ chapterCodeSnippets: [] });
}
