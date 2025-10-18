'use client';

import React, { useState, useTransition } from 'react';
import type { Chapter } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Bot, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { handleExplainCode, handleGenerateQuiz } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface ChapterEditorProps {
  chapter: Chapter;
  onUpdateChapter: (chapter: Chapter) => void;
  courseTitle: string;
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
  

export default function ChapterEditor({ chapter, onUpdateChapter, courseTitle }: ChapterEditorProps) {
  const [localChapter, setLocalChapter] = useState(chapter);
  const { toast } = useToast();
  const [isCodeExplanationPending, startCodeExplanationTransition] = useTransition();
  const [isQuizGenerationPending, startQuizGenerationTransition] = useTransition();


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

  const onGenerateQuiz = () => {
    if (!localChapter.summary) {
        toast({
          variant: 'destructive',
          title: 'Missing Chapter Summary',
          description: 'Please generate a summary for this chapter before creating a quiz.',
        });
        return;
      }
      startQuizGenerationTransition(async () => {
        const result = await handleGenerateQuiz({
          chapterContent: localChapter.summary,
          chapterTitle: localChapter.title,
        });
        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Quiz Generation Failed',
            description: result.error,
          });
        } else if (result.quiz) {
          const updatedChapter = { ...localChapter, quiz: result.quiz };
          setLocalChapter(updatedChapter);
          onUpdateChapter(updatedChapter);
          toast({
            title: 'Quiz Generated!',
            description: 'A new quiz question has been added to this chapter.',
          });
        }
      });
  }

  return (
    <Card className="h-full border-0 md:border shadow-none md:shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">{courseTitle}</CardTitle>
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

        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-lg">
                    <HelpCircle className="h-5 w-5" />
                    Knowledge Check
                </Label>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onGenerateQuiz}
                    disabled={isQuizGenerationPending || !localChapter.summary}
                >
                    {isQuizGenerationPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate Quiz
                </Button>
            </div>

            {localChapter.quiz ? (
                <Card className="bg-muted/40">
                    <CardContent className="p-4 space-y-4">
                        <p className="font-semibold">{localChapter.quiz.question}</p>
                        <RadioGroup defaultValue={localChapter.quiz.answer}>
                            {localChapter.quiz.options.map((option, index) => {
                                const isCorrect = option === localChapter.quiz.answer;
                                return (
                                <div key={index} 
                                    className={cn("flex items-center space-x-3 rounded-md border p-3",
                                    isCorrect ? "border-green-500/50 bg-green-500/10" : "border-transparent"
                                    )}
                                >
                                    <RadioGroupItem value={option} id={`option-${index}`} disabled />
                                    <Label htmlFor={`option-${index}`} className="flex-1">
                                    {option}
                                    </Label>
                                    {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                </div>
                                )
                            })}
                        </RadioGroup>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                    <p>No quiz for this chapter yet.</p>
                    <p>Click "Generate Quiz" to create one.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
