'use client';

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy } from 'lucide-react';
import type { Chapter } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ResumeExportDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  chapters: Chapter[];
}

export default function ResumeExportDialog({
  isOpen,
  setIsOpen,
  chapters,
}: ResumeExportDialogProps) {
  const { toast } = useToast();

  const markdownContent = useMemo(() => {
    let content = '### My CodeTube Course Project\n\n';
    content += 'A course created from a YouTube video, enhanced with AI-generated notes and code snippets.\n\n';

    chapters.forEach(chapter => {
      content += `#### ${chapter.title} (${chapter.timestamp})\n`;
      if (chapter.summary) {
        content += `- **Summary**: ${chapter.summary.split('\n')[0]}...\n`;
      }
      if (chapter.code) {
        const lang = 'javascript'; // Placeholder
        content += '```' + lang + '\n';
        content += chapter.code + '\n';
        content += '```\n';
      }
      content += '\n';
    });

    return content;
  }, [chapters]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownContent);
    toast({
      title: 'Copied to Clipboard!',
      description: 'The Markdown content is ready to be pasted.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Export for Résumé</DialogTitle>
          <DialogDescription>
            Copy the Markdown below to showcase this project on your résumé or portfolio.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <ScrollArea className="h-96 rounded-md border bg-secondary/20 p-4">
            <pre className="text-sm whitespace-pre-wrap font-code">{markdownContent}</pre>
          </ScrollArea>
          <Button
            size="icon"
            variant="outline"
            className="absolute top-2 right-2"
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
