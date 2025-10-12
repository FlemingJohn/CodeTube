'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Youtube } from 'lucide-react';
import type { Chapter } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface YoutubeImportProps {
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
}

export default function YoutubeImport({ setChapters }: YoutubeImportProps) {
  const { toast } = useToast();
  
  const handleAutoDetect = () => {
    // This is a simulation. In a real app, you'd fetch this data.
    const detectedChapters: Chapter[] = [
      { id: '101', timestamp: '00:15', title: 'Project Setup', summary: '', code: 'npm create-next-app@latest', transcript: 'First, lets set up our project using create next app.' },
      { id: '102', timestamp: '02:30', title: 'Component Creation', summary: '', code: 'export default function MyComponent() { return <div></div> }', transcript: 'Now we will create our first React component.' },
      { id: '103', timestamp: '05:45', title: 'Styling with Tailwind', summary: '', code: '<div className="p-4 bg-blue-500"></div>', transcript: 'Next, lets add some styling using Tailwind CSS utility classes.' },
    ];
    setChapters(detectedChapters);
    toast({
      title: 'Chapters Detected!',
      description: 'We found chapters in the video and added them.',
    });
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Youtube className="w-5 h-5 text-muted-foreground" />
        <Input placeholder="Paste YouTube link here..." />
      </div>
      <Button variant="outline" className="w-full" onClick={handleAutoDetect}>
        Auto-Detect Chapters
      </Button>
    </div>
  );
}
