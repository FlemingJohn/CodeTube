'use client';

import React, { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleYoutubeSearch, getYoutubeChapters } from '@/app/actions';
import Image from 'next/image';
import type { Chapter } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

interface VideoSearchDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  setCourseTitle: React.Dispatch<React.SetStateAction<string>>;
  setSelectedChapterId: React.Dispatch<React.SetStateAction<string | null>>;
  setVideoId: React.Dispatch<React.SetStateAction<string | null>>;
}

type VideoSearchResult = {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
};

export default function VideoSearchDialog({
  isOpen,
  setIsOpen,
  setChapters,
  setCourseTitle,
  setSelectedChapterId,
  setVideoId,
}: VideoSearchDialogProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoSearchResult[]>([]);
  const [isSearchPending, startSearchTransition] = useTransition();
  const [isImportPending, startImportTransition] = useTransition();

  const handleSearch = () => {
    if (!searchQuery) return;
    startSearchTransition(async () => {
      const result = await handleYoutubeSearch({ query: searchQuery });
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Search Failed',
          description: result.error,
        });
        setSearchResults([]);
      } else if (result.videos) {
        setSearchResults(result.videos);
      }
    });
  };

  const handleSelectVideo = (videoId: string) => {
    startImportTransition(async () => {
      const result = await getYoutubeChapters(videoId);
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error Importing Video',
          description: result.error,
        });
      } else if (result.chapters && result.videoTitle) {
        setVideoId(videoId);
        setChapters(result.chapters);
        setCourseTitle(result.videoTitle);
        setSelectedChapterId(result.chapters[0]?.id || null);
        
        toast({
          title: 'Video Imported!',
          description: `"${result.videoTitle}" has been loaded.`,
        });
        setIsOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Youtube /> Search YouTube
          </DialogTitle>
          <DialogDescription>
            Find a video to start creating your course.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search for a video..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearchPending || !searchQuery}>
            {isSearchPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="h-96 pr-4 -mr-4">
            <div className="space-y-4">
            {isSearchPending && (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}
            {!isSearchPending && searchResults.length > 0 && (
                searchResults.map((video) => (
                <div key={video.id} className="flex items-center gap-4 rounded-md border p-2">
                    <Image
                        src={video.thumbnail}
                        alt={video.title}
                        width={120}
                        height={90}
                        className="rounded-md aspect-video object-cover"
                    />
                    <div className="flex-grow">
                        <p className="font-semibold line-clamp-2">{video.title}</p>
                        <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
                    </div>
                    <Button 
                        size="sm"
                        onClick={() => handleSelectVideo(video.id)}
                        disabled={isImportPending}
                    >
                        {isImportPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Select'}
                    </Button>
                </div>
                ))
            )}
            {!isSearchPending && searchResults.length === 0 && searchQuery && (
                 <div className="text-center text-muted-foreground py-8">
                    <p>No results found for "{searchQuery}".</p>
                </div>
            )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
