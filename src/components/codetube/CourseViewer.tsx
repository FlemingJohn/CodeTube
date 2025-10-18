'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Chapter, Course } from '@/lib/types';
import VideoPlayer from './VideoPlayer';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Bot, Code, Sparkles, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const timestampToSeconds = (ts: string) => {
    const parts = ts.split(':').map(Number);
    if (parts.length === 3) { // hh:mm:ss
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) { // mm:ss
        return parts[0] * 60 + parts[1];
    }
    return 0;
};

const FormattedText = ({ text }: { text: string }) => {
    const codeRegex = /`([^`]+)`/g;
    const bulletRegex = /^\s*[-*]\s+/;

    const paragraphs = text.split(/\n\n+/);
  
    return (
      <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
        {paragraphs.map((paragraph, pIndex) => {
          const lines = paragraph.split('\n');
          const isList = lines.every(line => bulletRegex.test(line));

          if (isList) {
            return (
                <ul key={pIndex} className="list-disc space-y-2 pl-5">
                    {lines.map((line, lIndex) => (
                        <li key={lIndex}>{line.replace(bulletRegex, '')}</li>
                    ))}
                </ul>
            )
          }

          return (
            <p key={pIndex}>
              {paragraph.split(codeRegex).map((part, index) => {
                if (index % 2 === 1) {
                  return (
                    <code key={index} className="bg-muted text-foreground font-code px-1 py-0.5 rounded-sm text-xs">
                      {part}
                    </code>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
};
  
interface CourseViewerProps {
    course: Course;
}

export default function CourseViewer({ course }: CourseViewerProps) {
    const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
    const [playingChapterId, setPlayingChapterId] = useState<string | null>(null);
    const [player, setPlayer] = useState<any>(null);

    useEffect(() => {
        if (course.chapters.length > 0 && !selectedChapterId) {
            setSelectedChapterId(course.chapters[0].id);
        }
    }, [course.chapters, selectedChapterId]);

    const chapterStartTimes = useMemo(() => {
        return course.chapters.map(chapter => ({
          id: chapter.id,
          startTime: timestampToSeconds(chapter.timestamp),
        })).sort((a, b) => a.startTime - b.startTime);
      }, [course.chapters]);
    
    const selectedChapter = useMemo(
        () => course.chapters.find(c => c.id === selectedChapterId),
        [course.chapters, selectedChapterId]
    );

    useEffect(() => {
        if (!player) return;
      
        const interval = setInterval(() => {
            try {
                const currentTime = player.getCurrentTime();
                if (typeof currentTime !== 'number') return;
            
                let activeChapterId = null;
            
                // Find the chapter that is currently playing
                for (let i = chapterStartTimes.length - 1; i >= 0; i--) {
                    if (currentTime >= chapterStartTimes[i].startTime) {
                        activeChapterId = chapterStartTimes[i].id;
                        break;
                    }
                }
                setPlayingChapterId(activeChapterId);
            } catch (e) {
                // Can happen if the player is destroyed
                clearInterval(interval);
            }
        }, 1000); // Check every second
      
        return () => clearInterval(interval);
    }, [player, chapterStartTimes]);

    const onPlayerReady = (event: any) => {
        setPlayer(event.target);
    };

    const handleChapterSelect = (chapter: Chapter) => {
        setSelectedChapterId(chapter.id);
        if (player) {
            const seekTime = timestampToSeconds(chapter.timestamp);
            player.seekTo(seekTime);
            player.playVideo();
        }
    }

    return (
        <ResizablePanelGroup direction="horizontal" className="h-full max-h-[calc(100vh-4rem)]">
            <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                <ScrollArea className="h-full p-4">
                    <h2 className="text-lg font-bold font-headline mb-4">{course.title}</h2>
                    <div className="space-y-2">
                        {course.chapters.map(chapter => (
                            <div
                                key={chapter.id}
                                onClick={() => handleChapterSelect(chapter)}
                                className={cn(
                                    'group flex items-start justify-between rounded-md p-3 cursor-pointer transition-colors border',
                                    {
                                    'bg-primary/20 text-primary-foreground border-primary/30': playingChapterId === chapter.id && selectedChapterId !== chapter.id,
                                    'bg-primary/10 text-primary border-primary/20': selectedChapterId === chapter.id,
                                    'hover:bg-accent border-transparent': selectedChapterId !== chapter.id,
                                    }
                                )}
                            >
                                <div className="truncate">
                                    <p className="text-sm font-medium">{chapter.title}</p>
                                    <p className="text-xs text-muted-foreground">{chapter.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={75}>
                <ScrollArea className="h-full">
                    <div className="flex flex-col gap-6 p-4 md:p-6">
                        {course.videoId ? (
                            <VideoPlayer videoId={course.videoId} onReady={onPlayerReady} />
                        ) : (
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                                <p className="text-muted-foreground">No video available.</p>
                            </div>
                        )}

                        {selectedChapter && (
                            <div className="space-y-6">
                                <h1 className="text-3xl font-bold font-headline">{selectedChapter.title}</h1>
                                
                                {selectedChapter.summary && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 font-headline text-xl"><Sparkles className="w-5 h-5 text-primary" /> Notes</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <FormattedText text={selectedChapter.summary} />
                                        </CardContent>
                                    </Card>
                                )}

                                {selectedChapter.code && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 font-headline text-xl"><Code className="w-5 h-5 text-primary" /> Code Snippet</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <pre className="font-code text-sm bg-muted p-4 rounded-md overflow-x-auto"><code>{selectedChapter.code}</code></pre>
                                            {selectedChapter.codeExplanation && (
                                                <div className="mt-4 space-y-2">
                                                    <h3 className="font-semibold flex items-center gap-2"><Bot className="w-4 h-4"/> AI Explanation</h3>
                                                    <FormattedText text={selectedChapter.codeExplanation} />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
