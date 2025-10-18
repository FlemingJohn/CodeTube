'use client';

import React, { useState, useTransition } from 'react';
import type { Chapter } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Bot } from 'lucide-react';
import { handleExplainCode } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface ChapterEditorProps {
  chapter: Chapter;
  onUpdateChapter: (chapter: Chapter) => void;
}

const FormattedExplanation = ({ text }: { text: string }) => {
    // Split text into paragraphs by newline characters
    const paragraphs = text.split(/\n+/);
  
    // Regex to find code snippets enclosed in backticks
    const codeRegex = /`([^`]+)`/g;
  
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, pIndex) => {
          // Split paragraph by code snippets to interleave text and code
          const parts = paragraph.split(codeRegex);
          
          return (
            <p key={pIndex} className="text-sm font-sans leading-relaxed">
              {parts.map((part, index) => {
                // Every odd index is a code snippet
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
  

export default function ChapterEditor({ chapter, onUpdateChapter }: ChapterEditorProps) {
  const [localChapter, setLocalChapter] = useState(chapter);
  const { toast } = useToast();
  const [isCodeExplanationPending, startCodeExplanationTransition] = useTransition();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedChapter = { ...localChapter, [name]: value };
    setLocalChapter(updatedChapter);
    onUpdateChapter(updatedChapter);
  };

  const onExplainCode = () => {
    if (!localChapter.code) {
      toast({
        variant: 'destructive',
        title: 'No Code Found',
        description: 'Please add a code snippet before explaining.',
      });
      return;
    }
    startCodeExplanationTransition(async () => {
      const result = await handleExplainCode({ code: localChapter.code });
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else if (result.explanation) {
        const updatedChapter = { ...localChapter, codeExplanation: result.explanation };
        setLocalChapter(updatedChapter);
        onUpdateChapter(updatedChapter);
        toast({
          title: 'Code Explained',
          description: 'The AI-powered explanation has been generated.',
        });
      }
    });
  };

  return (
    <Card className="h-full border-0 md:border shadow-none md:shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Chapter Details</CardTitle>
        <CardDescription>Edit the details for the selected chapter.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-2 col-span-1">
            <Label htmlFor="timestamp">Timestamp</Label>
            <Input
              id="timestamp"
              name="timestamp"
              value={localChapter.timestamp}
              onChange={handleChange}
              placeholder="e.g., 01:23"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={localChapter.title}
              onChange={handleChange}
              placeholder="e.g., Setting up the project"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label htmlFor="code">Code Snippet</Label>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onExplainCode}
                    disabled={isCodeExplanationPending || !localChapter.code}
                >
                    {isCodeExplanationPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Explain Code
                </Button>
            </div>
          </div>
          <Textarea
            id="code"
            name="code"
            value={localChapter.code}
            onChange={handleChange}
            placeholder="Click 'Find Code' to get a snippet from the transcript, or paste your own."
            rows={8}
            className="font-code text-sm"
          />
        </div>

        {localChapter.codeExplanation && (
           <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI-Powered Code Explanation
            </Label>
             <Card className="bg-muted/40">
               <CardContent className="p-4">
                 <FormattedExplanation text={localChapter.codeExplanation} />
               </CardContent>
             </Card>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
