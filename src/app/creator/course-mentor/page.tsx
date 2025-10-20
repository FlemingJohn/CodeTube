'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, ArrowLeft, Youtube, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/codetube/Header';
import AuthHeader from '@/components/auth/AuthHeader';
import Link from 'next/link';
import { handleSuggestVideos, getYoutubeChapters } from '@/app/actions';
import Image from 'next/image';
import { Course } from '@/lib/types';
import { useRouter } from 'next/navigation';

type VideoSuggestion = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  justification: string;
};

type CategorizedSuggestions = {
  highlyRecommended: VideoSuggestion[];
  recommended: VideoSuggestion[];
  optional: VideoSuggestion[];
};

export default function CourseMentorPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isImporting, startImportTransition] = useTransition();

  const [topic, setTopic] = useState('');
  const [suggestions, setSuggestions] = useState<CategorizedSuggestions | null>(
    null
  );

  const handleGenerate = () => {
    if (!topic) {
      toast({
        variant: 'destructive',
        title: 'Please enter a topic to study.',
      });
      return;
    }
    startTransition(async () => {
      setSuggestions(null);
      try {
        const result = await handleSuggestVideos({ query: topic });
        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'An error occurred',
            description: result.error,
          });
        } else if (result.suggestions) {
          setSuggestions(result.suggestions);
        }
      } catch (e: any) {
        toast({
          variant: 'destructive',
          title: 'An error occurred',
          description: e.message,
        });
      }
    });
  };

  const handleImportCourse = (videoId: string) => {
    startImportTransition(async () => {
      const result = await getYoutubeChapters(videoId);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error Importing Video',
          description: result.error,
        });
      } else {
        // This is a simplified import. A real implementation might redirect to the creator studio
        // with the new course pre-filled. For now, we'll just show a success message.
        toast({
          title: 'Course Ready to Create!',
          description: `Video "${result.videoTitle}" is ready. Redirecting to creator studio...`,
        });
        // This is a simplified flow. A better UX would be to create the course
        // and then redirect the user to the new course's editing page.
        // For simplicity, we are just redirecting to the main creator page.
        router.push('/creator');
      }
    });
  };

  const SuggestionCard = ({ video }: { video: VideoSuggestion }) => (
    <Card className="flex flex-col md:flex-row gap-4 p-4">
      <div className="md:w-1/3">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          width={160}
          height={90}
          className="rounded-md w-full aspect-video object-cover"
        />
      </div>
      <div className="md:w-2/3 space-y-2">
        <p className="font-semibold">{video.title}</p>
        <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
        <p className="text-xs text-muted-foreground italic">
          <Sparkles className="w-3 h-3 inline-block mr-1" />
          {video.justification}
        </p>
        <Button
          size="sm"
          onClick={() => handleImportCourse(video.videoId)}
          disabled={isImporting}
        >
          {isImporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Youtube className="mr-2 h-4 w-4" />
          )}
          Add to Course
        </Button>
      </div>
    </Card>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-auto md:mr-4 flex">
            <Header />
          </div>
          <div className="flex items-center justify-end ml-auto">
            <AuthHeader />
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/creator">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
          <div className="text-center mt-4">
            <h1 className="text-4xl font-bold font-headline">Course Mentor</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Your personal AI guide to finding the best learning resources on
              YouTube.
            </p>
          </div>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>What do you want to learn today?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                placeholder="e.g., React hooks for beginners"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              />
              <Button onClick={handleGenerate} disabled={isPending}>
                <Search className="mr-2 h-4 w-4" />
                Get Suggestions
              </Button>
            </div>
          </CardContent>
        </Card>

        {isPending && (
          <div className="text-center mt-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">
              Finding and analyzing the best videos for you...
            </p>
          </div>
        )}

        {suggestions && (
          <div className="mt-12 space-y-12">
            <div>
              <h2 className="text-2xl font-bold font-headline mb-4">
                Highly Recommended
              </h2>
              <div className="space-y-4">
                {suggestions.highlyRecommended.map(video => (
                  <SuggestionCard key={video.videoId} video={video} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold font-headline mb-4">
                Recommended
              </h2>
              <div className="space-y-4">
                {suggestions.recommended.map(video => (
                  <SuggestionCard key={video.videoId} video={video} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold font-headline mb-4">
                Optional
              </h2>
              <div className="space-y-4">
                {suggestions.optional.map(video => (
                  <SuggestionCard key={video.videoId} video={video} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
