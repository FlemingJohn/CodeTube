'use client';

import React, { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Youtube } from 'lucide-react';
import type { Chapter } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getYoutubeChapters } from '@/app/actions';

interface YoutubeImportProps {
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  setCourseTitle: React.Dispatch<React.SetStateAction<string>>;
  setSelectedChapterId: React.Dispatch<React.SetStateAction<string | null>>;
  setVideoId: React.Dispatch<React.SetStateAction<string | null>>;
}

function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function YoutubeImport({ setChapters, setCourseTitle, setSelectedChapterId, setVideoId }: YoutubeImportProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  const handleAutoDetect = () => {
    const videoId = getYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      toast({
        variant: 'destructive',
        title: 'Invalid YouTube URL',
        description: 'Please paste a valid YouTube video URL.',
      });
      return;
    }
    
    startTransition(async () => {
      const result = await getYoutubeChapters(videoId);
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error Detecting Chapters',
          description: result.error,
        });
      } else if (result.chapters && result.videoTitle) {
        setVideoId(videoId);
        setChapters(result.chapters);
        setCourseTitle(result.videoTitle);
        setSelectedChapterId(result.chapters[0]?.id || null);
        
        if (result.chapters.length > 0) {
          toast({
            title: 'Chapters Detected!',
            description: 'We found chapters in the video and added them.',
          });
        } else {
          toast({
            title: 'Video Title Imported',
            description: "We couldn't find chapters, but we've set your course title.",
          });
        }
      }
    });
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Youtube className="w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Paste YouTube link here..." 
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
      </div>
      <Button variant="outline" className="w-full" onClick={handleAutoDetect} disabled={isPending || !youtubeUrl}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Auto-Detect Chapters
      </Button>
    </div>
  );
}
