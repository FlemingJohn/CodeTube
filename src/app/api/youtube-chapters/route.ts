import {NextRequest, NextResponse} from 'next/server';
import {google} from 'googleapis';
import type {Chapter} from '@/lib/types';

function parseChaptersFromDescription(description: string): Chapter[] {
  const chapterLines = description.match(/(\d{1,2}:)?\d{1,2}:\d{2}.*/g) || [];
  const chapters: Chapter[] = [];

  chapterLines.forEach((line, index) => {
    const match = line.match(/((\d{1,2}:)?\d{1,2}:\d{2})\s(.+)/);
    if (match) {
      const timestamp = match[1];
      const title = match[3].trim();
      chapters.push({
        id: Date.now().toString() + index,
        timestamp,
        title,
        summary: '',
        code: '',
        transcript: `Placeholder transcript for ${title}`,
      });
    }
  });

  return chapters;
}

export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const videoId = searchParams.get('videoId');
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!videoId) {
    return NextResponse.json({error: 'Video ID is required'}, {status: 400});
  }

  if (!apiKey) {
    return NextResponse.json(
      {error: 'YouTube API key is not configured'},
      {status: 500}
    );
  }

  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });

    const response = await youtube.videos.list({
      part: ['snippet'],
      id: [videoId],
    });

    const video = response.data.items?.[0];
    if (!video || !video.snippet?.description) {
      return NextResponse.json(
        {error: 'Video not found or has no description'},
        {status: 404}
      );
    }

    const chapters = parseChaptersFromDescription(video.snippet.description);

    if (chapters.length === 0) {
      return NextResponse.json(
        {error: 'No chapters found in the video description.'},
        {status: 404}
      );
    }

    return NextResponse.json({chapters});
  } catch (error: any) {
    console.error('Error fetching from YouTube API:', error);
    return NextResponse.json(
      {error: error.message || 'Failed to fetch chapters from YouTube API.'},
      {status: 500}
    );
  }
}
