
'use client';

import type { Chapter } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChapterListProps {
  chapters: Chapter[];
  onChaptersUpdate: (chapters: Chapter[]) => void;
  selectedChapterId: string | null;
  setSelectedChapterId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function ChapterList({
  chapters,
  onChaptersUpdate,
  selectedChapterId,
  setSelectedChapterId,
}: ChapterListProps) {
  const addChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      timestamp: '00:00',
      title: 'New Chapter',
      summary: '',
      code: '',
      codeExplanation: '',
      transcript: 'This is a new chapter. Please add a transcript.',
    };
    onChaptersUpdate([...chapters, newChapter]);
    setSelectedChapterId(newChapter.id);
  };

  const deleteChapter = (idToDelete: string) => {
    onChaptersUpdate(chapters.filter(c => c.id !== idToDelete));
    if (selectedChapterId === idToDelete) {
      setSelectedChapterId(null);
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
                onClick={() => setSelectedChapterId(chapter.id)}
                className={`group flex items-center justify-between rounded-md p-2 cursor-pointer transition-colors ${
                  selectedChapterId === chapter.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent'
                }`}
              >
                <div className="truncate">
                  <p className="text-sm font-medium">{chapter.title}</p>
                  <p className="text-xs text-muted-foreground">{chapter.timestamp}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChapter(chapter.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
