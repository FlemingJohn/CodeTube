
'use client';

import type { Chapter, TranscriptEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useCreatorStudio } from '@/hooks/use-creator-studio';

interface ChapterListProps {
  chapters: Chapter[];
  videoId: string | null;
  selectedChapterId: string | null;
  playingChapterId: string | null;
  onChapterSelect: (chapter: Chapter | null) => void;
}

export default function ChapterList({
  chapters,
  videoId,
  selectedChapterId,
  playingChapterId,
  onChapterSelect,
}: ChapterListProps) {
  const { setCourse } = useCreatorStudio();

  const addChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      timestamp: '00:00',
      title: 'New Chapter',
      summary: '',
      code: '',
      codeExplanation: '',
      transcript: [],
    };
    setCourse(prev => prev ? ({ ...prev, chapters: [...prev.chapters, newChapter] }) : null);
    onChapterSelect(newChapter);
  };

  const deleteChapter = (idToDelete: string) => {
    const newChapters = chapters.filter(c => c.id !== idToDelete);
    setCourse(prev => prev ? ({ ...prev, chapters: newChapters }) : null);
    if (selectedChapterId === idToDelete) {
      onChapterSelect(newChapters.length > 0 ? newChapters[0] : null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground px-2">CHAPTERS</h3>
        <Button variant="ghost" size="icon" onClick={addChapter} className="h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-96">
        <div className="space-y-1 pr-2">
          {chapters.length > 0 ? (
            chapters.map(chapter => (
              <div
                key={chapter.id}
                onClick={() => onChapterSelect(chapter)}
                className={cn(
                    'group flex items-center justify-between rounded-md p-2 cursor-pointer transition-colors',
                    {
                      'bg-primary/20 text-primary-foreground': playingChapterId === chapter.id && selectedChapterId !== chapter.id,
                      'bg-primary/10 text-primary': selectedChapterId === chapter.id,
                      'hover:bg-accent': selectedChapterId !== chapter.id,
                    }
                  )}
              >
                {videoId && (
                   <Image src={`https://i.ytimg.com/vi/${videoId}/default.jpg`} alt={chapter.title} width={48} height={36} className="rounded-sm mr-2 object-cover aspect-video" />
                )}
                <div className="truncate flex-1">
                  <p className="text-sm font-medium">{chapter.title}</p>
                  <p className="text-xs text-muted-foreground">{chapter.timestamp}</p>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteChapter(chapter.id);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              <p>No chapters yet.</p>
              <p>Add a chapter to get started.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
