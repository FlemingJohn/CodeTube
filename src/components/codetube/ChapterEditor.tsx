
'use client';

import React, { useState, useTransition, useEffect } from 'react';
import type { Chapter, InterviewQuestion, Quiz } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Bot, HelpCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { handleExplainCode, handleGenerateQuiz } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface ChapterEditorProps {
  chapter: Chapter;
  onUpdateChapter: (chapter: Chapter) => void;
  courseTitle: string;
}

const FormattedExplanation = ({ text }: { text: string }) => {
    const paragraphs = text.split(/\n+/);
    const codeRegex = /`([^`]+)`/g;
  
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, pIndex) => {
          const parts = paragraph.split(codeRegex);
          
          return (
            <p key={pIndex} className="text-sm font-sans leading-relaxed">
              {parts.map((part, index) => {
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
  

const QuizCard = ({ quiz, index }: { quiz: Quiz; index: number }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);

    const handleValueChange = (value: string) => {
        setSelectedAnswer(value);
        setShowAnswer(true);
    };

    const isSubmitted = showAnswer || selectedAnswer !== null;

    return (
        <Card className="bg-muted/40">
            <CardContent className="p-4 space-y-4">
                <p className="font-semibold">{index + 1}. {quiz.question}</p>
                <RadioGroup value={selectedAnswer || undefined} onValueChange={handleValueChange}>
                    {quiz.options.map((option, idx) => {
                        const isCorrect = option === quiz.answer;
                        const isSelected = option === selectedAnswer;

                        return (
                        <div key={idx} 
                            className={cn("flex items-center space-x-3 rounded-md border p-3 transition-colors",
                                isSubmitted && isCorrect && "border-green-500/50 bg-green-500/10",
                                isSubmitted && isSelected && !isCorrect && "border-red-500/50 bg-red-500/10",
                            )}
                        >
                            <RadioGroupItem value={option} id={`option-${index}-${idx}`} disabled={isSubmitted} />
                            <Label htmlFor={`option-${index}-${idx}`} className={cn("flex-1", isSubmitted ? "cursor-default" : "cursor-pointer")}>
                            {option}
                            </Label>
                            {isSubmitted && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                            {isSubmitted && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                        </div>
                        )
                    })}
                </RadioGroup>
                {isSubmitted && (
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedAnswer(null); setShowAnswer(false); }}>
                        Try Again
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default function ChapterEditor({ chapter, onUpdateChapter, courseTitle }: ChapterEditorProps) {
  const [localChapter, setLocalChapter] = useState(chapter);
  const { toast } = useToast();
  const [isCodeExplanationPending, startCodeExplanationTransition] = useTransition();
  const [isQuizGenerationPending, startQuizGenerationTransition] = useTransition();

  useEffect(() => {
    setLocalChapter(chapter);
  }, [chapter]);


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
    if (!localChapter.transcript) {
        toast({
          variant: 'destructive',
          title: 'Missing Chapter Transcript',
          description: 'A transcript is required to generate a quiz.',
        });
        return;
      }
      startQuizGenerationTransition(async () => {
        const result = await handleGenerateQuiz({
          transcript: localChapter.transcript,
          chapterTitle: localChapter.title,
        });
        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Quiz Generation Failed',
            description: result.error,
          });
        } else if (result.questions) {
          const updatedChapter = { ...localChapter, quiz: result.questions };
          setLocalChapter(updatedChapter);
          onUpdateChapter(updatedChapter);
          toast({
            title: 'Quiz Generated!',
            description: 'A new 5-question quiz has been added to this chapter.',
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
                <Label className="flex items-center gap-2 text-lg font-headline">
                    <HelpCircle className="h-5 w-5" />
                    Knowledge Check
                </Label>
                <div className="flex items-center gap-4">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onGenerateQuiz}
                        disabled={isQuizGenerationPending || !localChapter.transcript}
                    >
                        {isQuizGenerationPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Generate Quiz
                    </Button>
                </div>
            </div>

            {localChapter.quiz && localChapter.quiz.length > 0 ? (
                <ScrollArea className="h-96 pr-4">
                    <div className="space-y-4">
                        {localChapter.quiz.map((q, index) => (
                            <QuizCard key={index} quiz={q} index={index} />
                        ))}
                    </div>
                </ScrollArea>
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
