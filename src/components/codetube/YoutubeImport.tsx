
'use client';

import React, { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Youtube, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getYoutubeChapters } from '@/app/actions';
import { useCreatorStudio } from '@/hooks/use-creator-studio';

interface YoutubeImportProps {
  setSearchDialogOpen: (isOpen: boolean) => void;
}

function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function YoutubeImport({ setSearchDialogOpen }: YoutubeImportProps) {
  const { setCourse } = useCreatorStudio();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  const handleAutoDetect = async () => {
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
      try {
        const result = await getYoutubeChapters(videoId);
      
        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Error Importing Video',
            description: result.error,
          });
        } else if (result.chapters && result.videoTitle) {
          setCourse(prev => ({
            ...prev!,
            videoId: videoId,
            chapters: result.chapters,
            title: result.videoTitle,
          }));
          
          if (result.chapters.length > 0) {
            toast({
              title: 'Video Imported!',
              description: `"${result.videoTitle}" has been loaded.`,
            });
          } else {
            toast({
              title: 'Video Imported',
              description: `"${result.videoTitle}" has been loaded. We couldn't find chapters in the description.`,
            });
          }
          
          if (result.warning) {
              toast({
                  variant: 'default',
                  title: 'Note',
                  description: result.warning,
              })
          }
        }
      } catch(e: any) {
          toast({
            variant: 'destructive',
            title: 'Error Importing Video',
            description: e.message || "An unexpected error occurred."
          });
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
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="w-full" onClick={handleAutoDetect} disabled={isPending || !youtubeUrl}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Import Link
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => setSearchDialogOpen(true)}>
            <Search className="mr-2 h-4 w-4" />
            Search
        </Button>
      </div>
    </div>
  );
}
