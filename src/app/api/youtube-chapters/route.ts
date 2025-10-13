import {NextRequest, NextResponse} from 'next/server';

/**
 * This API route is no longer in use. The logic has been moved directly into a server action
 * in src/app/actions.ts for better reliability in serverless environments like Vercel.
 * This file can be safely deleted.
 */
export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      error:
        'This API endpoint is deprecated. Please use the getYoutubeChapters server action instead.',
    },
    {status: 410}
  );
}
