
'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import type { Chapter, Quiz } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Bot, HelpCircle, CheckCircle2, XCircle, Play, ShieldAlert, CaseUpper, Book, Pilcrow, Type, Bold, Italic, List, Code as CodeIcon, Eye, Info, Cloud, Languages } from 'lucide-react';
import { handleExplainCode, handleGenerateQuiz, handleRunCode, handleFixCodeError, handleProofreadText, handleRewriteText, handleWriteText, handleTranslateText, handleGenerateSummary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RunCodeOutput } from '@/ai/flows/judge0-flow';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChromeAi } from '@/hooks/useChromeAi';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';


interface ChapterEditorProps {
  chapter: Chapter;
  onUpdateChapter: (chapter: Chapter) => void;
  courseTitle: string;
}

const TONES = ['Explanatory', 'Concise', 'Beginner-Friendly', 'Technical', 'Formal'];
const LANGUAGES = ['Spanish', 'French', 'German', 'Japanese', 'Mandarin'];

const FormattedText = ({ text }: { text: string }) => {
    const markdownToHtml = (markdown: string) => {
        let html = markdown
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Inline code
            .replace(/`(.*?)`/g, '<code class="bg-muted text-foreground font-code px-1 py-0.5 rounded-sm text-xs">$1</code>');

        // Lists
        const listRegex = /((?:^\s*[-*]\s+.*\n?)+)/gm;
        html = html.replace(listRegex, (match) => {
            const items = match.trim().split('\n').map(item =>
                `<li class="ml-4">${item.replace(/^\s*[-*]\s+/, '')}</li>`
            ).join('');
            return `<ul class="list-disc list-outside space-y-1 my-2">${items}</ul>`;
        });
        
        return html;
    };

    const paragraphs = text.split(/\n\n+/);

    return (
        <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
            {paragraphs.map((paragraph, pIndex) => (
                 <p key={pIndex} dangerouslySetInnerHTML={{ __html: markdownToHtml(paragraph) }} />
            ))}
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

// Language IDs from Judge0 documentation
const languageOptions = [
    { value: '63', label: 'JavaScript' },
    { value: '71', label: 'Python' },
    { value: '74', label: 'TypeScript' },
    { value: '62', label: 'Java' },
    { value: '54', label: 'C++' },
    { value: '50', label: 'C' },
    { value: '60', label: 'Go' },
    { value: '51', label: 'C#' },
];

export default function ChapterEditor({ chapter, onUpdateChapter, courseTitle }: ChapterEditorProps) {
  const [localChapter, setLocalChapter] = useState(chapter);
  const { toast } = useToast();
  const [isAiEditing, startAiEditTransition] = useTransition();
  const [isCodeExplanationPending, startCodeExplanationTransition] = useTransition();
  const [isQuizGenerationPending, startQuizGenerationTransition] = useTransition();
  const [isRunCodePending, startRunCodeTransition] = useTransition();
  const [isFixCodePending, startFixCodeTransition] = useTransition();
  const [codeOutput, setCodeOutput] = useState<RunCodeOutput | null>(null);
  const [fixExplanation, setFixExplanation] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('63'); // Default to JavaScript
  const summaryTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { aiAvailable, proofread, rewrite, write, summarize, translate } = useChromeAi();


  useEffect(() => {
    setLocalChapter(chapter);
  }, [chapter]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedChapter = { ...localChapter, [name]: value };
    setLocalChapter(updatedChapter);
    onUpdateChapter(updatedChapter);
  };
  
  const handleSummaryChange = (newSummary: string) => {
    const updatedChapter = { ...localChapter, summary: newSummary };
    setLocalChapter(updatedChapter);
    onUpdateChapter(updatedChapter);
  }

  const handleCodeChange = (code: string) => {
    const updatedChapter = { ...localChapter, code: code };
    setLocalChapter(updatedChapter);
    onUpdateChapter(updatedChapter);
  }

  const applyMarkdown = (syntax: 'bold' | 'italic' | 'code' | 'list') => {
    const textarea = summaryTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let newText;

    switch (syntax) {
        case 'bold':
            newText = `**${selectedText}**`;
            break;
        case 'italic':
            newText = `*${selectedText}*`;
            break;
        case 'code':
            newText = `\`${selectedText}\``;
            break;
        case 'list':
            const lines = selectedText.split('\n');
            if (lines.every(line => line.startsWith('- '))) {
                // If it's already a list, unlist it
                newText = lines.map(line => line.substring(2)).join('\n');
            } else {
                newText = lines.map(line => `- ${line}`).join('\n');
            }
            break;
        default:
            newText = selectedText;
    }

    const updatedValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    handleSummaryChange(updatedValue);
    
    // Focus and re-select text for convenience
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
          textarea.setSelectionRange(start, start + newText.length);
      } else {
          const newCursorPos = start + (syntax === 'list' ? 2 : (syntax === 'bold' ? 2 : 1));
          textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
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

  const onRunCode = () => {
    if (!localChapter.code) {
      toast({
        variant: 'destructive',
        title: 'No Code Found',
        description: 'Please add a code snippet before running.',
      });
      return;
    }
    startRunCodeTransition(async () => {
      setCodeOutput(null); // Clear previous output
      setFixExplanation(null);
      const result = await handleRunCode({ 
        source_code: localChapter.code, 
        language_id: parseInt(selectedLanguage) 
      });
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Execution Error',
          description: result.error,
        });
      } else if (result.result) {
        setCodeOutput(result.result);
        toast({
          title: 'Code Executed',
          description: `Status: ${result.result.status.description}`,
        });
      }
    });
  }

  const onFixCode = () => {
    const errorLog = codeOutput?.stderr || codeOutput?.compile_output;
    if (!localChapter.code || !errorLog) {
      toast({
        variant: 'destructive',
        title: 'Nothing to Fix',
        description: 'No code or error message found to fix.',
      });
      return;
    }
    startFixCodeTransition(async () => {
      const result = await handleFixCodeError({
        code: localChapter.code,
        error: errorLog,
      });

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'AI Fix Failed',
          description: result.error,
        });
      } else if (result.fixedCode && result.explanation) {
        handleCodeChange(result.fixedCode);
        setFixExplanation(result.explanation);
        toast({
          title: 'Code Fixed!',
          description: 'The AI has corrected the code and provided an explanation.',
        });
        setCodeOutput(null); // Clear the error output
      }
    });
  };

  const hasError = codeOutput && (codeOutput.status.id > 3 || codeOutput.stderr || codeOutput.compile_output);

  const handleAiEdit = (action: 'proofread' | 'rewrite' | 'write' | 'tone' | 'translate' | 'summarize', context?: string) => {
    startAiEditTransition(async () => {
      let result;
      const originalText = localChapter.summary;
      if (!originalText && ['proofread', 'rewrite', 'tone', 'translate'].includes(action)) {
        toast({ variant: 'destructive', title: 'Nothing to edit', description: 'Please write some notes first.' });
        return;
      }

      try {
        if (aiAvailable) {
            // Use client-side AI
            if (action === 'proofread') result = await proofread(originalText);
            else if (action === 'rewrite' || action === 'tone') result = await rewrite(originalText, context);
            else if (action === 'write') result = await write(`Write a brief summary for a video chapter titled: "${localChapter.title}"`);
            else if (action === 'summarize') result = await summarize(localChapter.transcript, localChapter.title);
            else if (action === 'translate') result = await translate(originalText, context!);
        } else {
            // Fallback to server-side AI
            if (action === 'proofread') {
                const serverResult = await handleProofreadText(originalText);
                if (serverResult.error) throw new Error(serverResult.error);
                result = serverResult.proofreadText;
            } else if (action === 'rewrite' || action === 'tone') {
                const serverResult = await handleRewriteText(originalText, context);
                if (serverResult.error) throw new Error(serverResult.error);
                result = serverResult.rewrittenText;
            } else if (action === 'write') {
                const serverResult = await handleWriteText(`Write a brief summary for a video chapter titled: "${localChapter.title}"`);
                if (serverResult.error) throw new Error(serverResult.error);
                result = serverResult.writtenText;
            } else if (action === 'summarize') {
                const serverResult = await handleGenerateSummary({ transcript: localChapter.transcript, chapterTitle: localChapter.title });
                if (serverResult.error) throw new Error(serverResult.error);
                result = serverResult.summary;
            } else if (action === 'translate') {
                const serverResult = await handleTranslateText(originalText, context!);
                if (serverResult.error) throw new Error(serverResult.error);
                result = serverResult.translatedText;
            }
        }

        if (result) {
            handleSummaryChange(result);
            toast({ title: 'AI Edit Successful', description: `Your text has been updated.` });
        }
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'AI Task Failed', description: e.message });
      }
    });
  };

  const AiEditButton = ({children, ...props}: React.ComponentProps<typeof Button>) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button {...props}>
                        {children}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="flex items-center gap-2">
                        {aiAvailable ? (
                            <><CheckCircle2 className="h-4 w-4 text-green-500" /> Using on-device AI</>
                        ) : (
                            <><Cloud className="h-4 w-4 text-blue-500" /> Using cloud AI</>
                        )}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
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

        <Tabs defaultValue="edit" className="w-full">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                <Label htmlFor="summary">Chapter Notes</Label>
                <div className="flex items-center gap-2">
                <TabsList className="grid grid-cols-2 h-8">
                    <TabsTrigger value="edit" className='h-6'>Edit</TabsTrigger>
                    <TabsTrigger value="preview" className='h-6'>Preview</TabsTrigger>
                </TabsList>
                {isAiEditing ? <Loader2 className="h-4 w-4 animate-spin"/> : null}
                     <AiEditButton size="sm" variant="ghost" onClick={() => handleAiEdit('summarize')} disabled={isAiEditing || !localChapter.transcript}>
                        <Type className="mr-2"/> Generate Summary
                     </AiEditButton>
                    {localChapter.summary && (
                        <>
                        <Popover>
                            <PopoverTrigger asChild>
                                <AiEditButton size="sm" variant="ghost" disabled={isAiEditing}>
                                    <Wand2 className="mr-2" /> Writing Tools
                                </AiEditButton>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2">
                                <div className="grid gap-1">
                                    <Button variant="ghost" className="justify-start" onClick={() => handleAiEdit('rewrite')}>
                                        <CaseUpper className="mr-2"/> Improve Writing
                                    </Button>
                                    <Button variant="ghost" className="justify-start" onClick={() => handleAiEdit('proofread')}>
                                        <Book className="mr-2"/> Fix Grammar
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="justify-start">
                                                <Pilcrow className="mr-2"/> Change Tone
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" align="start">
                                            {TONES.map(tone => (
                                                <DropdownMenuItem key={tone} onClick={() => handleAiEdit('tone', tone)}>
                                                    {tone}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </PopoverContent>
                        </Popover>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <AiEditButton size="sm" variant="ghost" disabled={isAiEditing}>
                                    <Languages className="mr-2" /> Translate
                                </AiEditButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {LANGUAGES.map(lang => (
                                    <DropdownMenuItem key={lang} onClick={() => handleAiEdit('translate', lang)}>
                                        {lang}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </>
                    )}
                </div>
            </div>
            <TabsContent value="edit" className="mt-0">
                <div className="rounded-md border border-input">
                    <div className="p-1 border-b">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => applyMarkdown('bold')}><Bold className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => applyMarkdown('italic')}><Italic className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => applyMarkdown('code')}><CodeIcon className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => applyMarkdown('list')}><List className="h-4 w-4"/></Button>
                        </div>
                    </div>
                    <Textarea
                        id="summary"
                        name="summary"
                        ref={summaryTextareaRef}
                        value={localChapter.summary}
                        onChange={e => handleSummaryChange(e.target.value)}
                        placeholder="Write your notes here, or use the AI tools to generate them."
                        rows={6}
                        className="text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
            </TabsContent>
             <TabsContent value="preview" className="mt-0">
                <Card className="min-h-[158px]">
                    <CardContent className="p-4">
                        {localChapter.summary ? (
                            <FormattedText text={localChapter.summary} />
                        ) : (
                            <p className="text-muted-foreground text-sm">Nothing to preview. Add some notes in the edit tab.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>


        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="code">Code Snippet</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="h-8 w-fit">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={onRunCode}
                    disabled={isRunCodePending || !localChapter.code}
                >
                    {isRunCodePending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Play className="mr-2 h-4 w-4" />
                    )}
                    Run Code
                </Button>
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

        {isRunCodePending && (
            <div className="space-y-2">
                <Label>Code Output</Label>
                <Card className="bg-muted/40">
                    <CardContent className="p-4 font-code text-sm flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                        <span>Running code...</span>
                    </CardContent>
                </Card>
            </div>
        )}

        {codeOutput && (
            <div className="space-y-2">
                <Label>Code Output</Label>
                <Card className={cn("font-code text-sm", hasError ? "bg-destructive/10 border-destructive/50" : "bg-muted/40")}>
                    <CardHeader className="p-4 flex flex-row items-center justify-between">
                      <CardTitle className={cn("text-base flex items-center gap-2", hasError ? "text-destructive" : "")}>
                        {hasError && <ShieldAlert className="h-5 w-5" />}
                        Status: {codeOutput.status.description}
                      </CardTitle>
                      {hasError && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={onFixCode}
                            disabled={isFixCodePending}
                          >
                            {isFixCodePending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Wand2 className="mr-2 h-4 w-4" />
                            )}
                            Fix Error with AI
                          </Button>
                      )}
                    </CardHeader>
                    {(codeOutput.stdout || codeOutput.stderr || codeOutput.compile_output) && (
                      <CardContent className="p-4 pt-0">
                          <pre className="bg-background/50 p-3 rounded-md whitespace-pre-wrap">
                              {codeOutput.stdout || codeOutput.stderr || codeOutput.compile_output}
                          </pre>
                      </CardContent>
                    )}
                </Card>
            </div>
        )}
        
        {fixExplanation && (
             <div className="space-y-2">
                <Label className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Fix Explanation
                </Label>
                <Card className="bg-blue-500/10 border-blue-500/30">
                    <CardContent className="p-4">
                        <FormattedText text={fixExplanation} />
                    </CardContent>
                </Card>
             </div>
        )}

        {localChapter.codeExplanation && (
           <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI-Powered Code Explanation
            </Label>
             <Card className="bg-muted/40">
               <CardContent className="p-4">
                 <FormattedText text={localChapter.codeExplanation} />
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

    
    