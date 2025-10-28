'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import type { Chapter, Quiz, TranscriptEntry } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Bot, HelpCircle, CheckCircle2, XCircle, Play, ShieldAlert, CaseUpper, Book, Pilcrow, Type, Bold, Italic, List, Code as CodeIcon, Eye, Info, Cloud, Languages, Mic, Square, Camera, FileText } from 'lucide-react';
import { handleExplainCode, handleGenerateQuiz, handleRunCode, handleFixCodeError, handleProofreadText, handleRewriteText, handleWriteText, handleTranslateText, handleGenerateSummary, handleSpeechToText } from '@/app/actions';
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
import { useFocusMode } from '@/hooks/use-focus-mode.tsx';
import { useCreatorStudio } from '@/hooks/use-creator-studio';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const TONES = ['Explanatory', 'Concise', 'Formal', 'Casual', 'Persuasive'];
const LANGUAGES = ['Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Russian', 'Arabic'];

enum RecordingState {
    Idle,
    RequestingPermission,
    Recording,
    Transcribing,
}


const FormattedText = ({ text, onTimestampClick }: { text: string, onTimestampClick: (time: number) => void }) => {
    const markdownToHtml = (markdown: string) => {
        let html = markdown
            // Handle timestamped images: [![<timestamp>](<thumbnail_url>)](<video_url_with_time>)
            .replace(/\[!\[(.*?)\]\((.*?)\)\]\(https?:\/\/www\.youtube\.com\/watch\?v=.*?&t=(\d+)s\)/g, (match, timestamp, thumbnailUrl, timeInSeconds) => {
                return `<a href="#" data-timestamp="${timeInSeconds}" class="block relative no-underline my-4 group timestamp-link">
                            <img src="${thumbnailUrl}" alt="Video snapshot at ${timestamp}" class="rounded-md border w-full object-cover aspect-video" />
                            <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-circle"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16 10,8"/></svg>
                            </div>
                            <div class="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">${timestamp}</div>
                        </a>`;
            })
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
    
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentRef = contentRef.current;
        if (currentRef) {
            const handleClick = (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                const link = target.closest('.timestamp-link') as HTMLAnchorElement;
                if (link) {
                    e.preventDefault();
                    const timestamp = link.dataset.timestamp;
                    if (timestamp) {
                        onTimestampClick(Number(timestamp));
                    }
                }
            };
            currentRef.addEventListener('click', handleClick);
            return () => {
                currentRef.removeEventListener('click', handleClick);
            };
        }
    }, [onTimestampClick]);


    return (
        <div ref={contentRef} className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
            {paragraphs.map((paragraph, pIndex) => (
                 <div key={pIndex} dangerouslySetInnerHTML={{ __html: markdownToHtml(paragraph) }} />
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

interface ChapterEditorProps {
  chapter: Chapter;
}

export default function ChapterEditor({ chapter }: ChapterEditorProps) {
  const { course, setCourse, player } = useCreatorStudio();
  const { toast } = useToast();
  const { settings } = useFocusMode();
  const [isAiEditing, startAiEditTransition] = useTransition();
  const [isAiGenerating, startAiGenerationTransition] = useTransition();
  const [isCodeExplanationPending, startCodeExplanationTransition] = useTransition();
  const [isRunCodePending, startRunCodeTransition] = useTransition();
  const [isFixCodePending, startFixCodeTransition] = useTransition();
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.Idle);
  const [codeOutput, setCodeOutput] = useState<RunCodeOutput | null>(null);
  const [fixExplanation, setFixExplanation] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('63'); // Default to JavaScript
  const summaryTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { aiAvailable, proofread, rewrite, write, summarize, translate } = useChromeAi();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleUpdateChapter = (updatedChapter: Chapter) => {
    setCourse(prevCourse => {
        if (!prevCourse) return null;
        const newChapters = prevCourse.chapters.map(c => c.id === updatedChapter.id ? updatedChapter : c);
        return { ...prevCourse, chapters: newChapters };
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleUpdateChapter({ ...chapter, [name]: value });
  };
  
  const handleSummaryChange = (newSummary: string) => {
    handleUpdateChapter({ ...chapter, summary: newSummary });
  }

  const handleCodeChange = (code: string) => {
    handleUpdateChapter({ ...chapter, code: code });
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

  const handleTimestampClick = (time: number) => {
    if (player && typeof player.seekTo === 'function') {
        player.seekTo(time);
        player.playVideo();
    }
  };
  
  const onAddSnapshot = () => {
    if (!player || typeof player.getCurrentTime !== 'function' || !course?.videoId) {
        toast({ variant: 'destructive', title: 'Video player not ready', description: 'Please wait for the video to load before taking a snapshot.' });
        return;
    }
    const currentTime = Math.floor(player.getCurrentTime());
    const hours = Math.floor(currentTime / 3600);
    const minutes = Math.floor((currentTime % 3600) / 60);
    const seconds = currentTime % 60;

    const format = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${hours > 0 ? format(hours)+':' : ''}${format(minutes)}:${format(seconds)}`;

    const videoUrl = `https://www.youtube.com/watch?v=${course.videoId}&t=${currentTime}s`;
    const thumbnailUrl = `https://i.ytimg.com/vi/${course.videoId}/mqdefault.jpg`;

    const markdownImage = `\n\n[![${timestamp}](${thumbnailUrl})](${videoUrl})\n\n`;
    
    const textarea = summaryTextareaRef.current;
    if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const updatedValue = textarea.value.substring(0, start) + markdownImage + textarea.value.substring(end);
        handleSummaryChange(updatedValue);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + markdownImage.length, start + markdownImage.length);
        }, 0);
    } else {
        // Fallback if ref isn't available for some reason
        const currentSummary = chapter.summary || '';
        handleSummaryChange(currentSummary + markdownImage);
    }

    toast({ title: 'Snapshot Added!', description: `A clickable snapshot at ${timestamp} has been inserted into your notes.` });
  };


  const onExplainCode = () => {
    if (!chapter.code) {
      toast({
        variant: 'destructive',
        title: 'No Code Found',
        description: 'Please add a code snippet before explaining.',
      });
      return;
    }
    startCodeExplanationTransition(async () => {
      const result = await handleExplainCode({ code: chapter.code });
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else if (result.explanation) {
        handleUpdateChapter({ ...chapter, codeExplanation: result.explanation });
        toast({
          title: 'Code Explained',
          description: 'The AI-powered explanation has been generated.',
        });
      }
    });
  };
  
  const chapterTranscriptText = (Array.isArray(chapter.transcript) && chapter.transcript.length > 0) 
  ? chapter.transcript.map(t => t.text).join(' ') 
  : '';


  const handleAiGeneration = (action: 'summarize' | 'quiz') => {
    if (!chapterTranscriptText) {
      toast({ variant: 'destructive', title: 'Missing Transcript', description: 'A chapter transcript is needed for AI generation.' });
      return;
    }
    startAiGenerationTransition(async () => {
      try {
        if (action === 'summarize') {
          let summaryResult;
          if (aiAvailable) {
            summaryResult = await summarize(chapterTranscriptText, chapter.title);
          } else {
            const serverResult = await handleGenerateSummary({ transcript: chapterTranscriptText, chapterTitle: chapter.title });
            if (serverResult.error) throw new Error(serverResult.error);
            summaryResult = serverResult.summary;
          }
          if (summaryResult) {
            handleSummaryChange(summaryResult);
            toast({ title: 'Summary Generated!', description: `AI-powered notes have been added.` });
          } else {
            throw new Error("The AI didn't return a result.");
          }
        } else if (action === 'quiz') {
          // Quiz generation always uses server-side AI for now due to complexity
          const result = await handleGenerateQuiz({ transcript: chapterTranscriptText, chapterTitle: chapter.title });
          if (result.error) {
            throw new Error(result.error);
          } else if (result.questions) {
            handleUpdateChapter({ ...chapter, quiz: result.questions });
            toast({ title: 'Quiz Generated!', description: 'A new 5-question quiz has been added.' });
          }
        }
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'AI Task Failed', description: e.message });
      }
    });
  };

  const onRunCode = () => {
    if (!chapter.code) {
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
        source_code: chapter.code, 
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
    if (!chapter.code || !errorLog) {
      toast({
        variant: 'destructive',
        title: 'Nothing to Fix',
        description: 'No code or error message found to fix.',
      });
      return;
    }
    startFixCodeTransition(async () => {
      const result = await handleFixCodeError({
        code: chapter.code,
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

  const handleAiEdit = (action: 'proofread' | 'rewrite' | 'write' | 'tone' | 'translate', context?: string) => {
    startAiEditTransition(async () => {
      let result;
      const originalText = chapter.summary;
      if (!originalText && ['proofread', 'rewrite', 'tone', 'translate'].includes(action)) {
        toast({ variant: 'destructive', title: 'Nothing to edit', description: 'Please write some notes first.' });
        return;
      }

      try {
        if (aiAvailable) {
            // Use client-side AI
            if (action === 'proofread') result = await proofread(originalText);
            else if (action === 'rewrite' || action === 'tone') result = await rewrite(originalText, context);
            else if (action === 'write') result = await write(`Write a brief summary for a video chapter titled: "${chapter.title}"`);
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
                const serverResult = await handleWriteText(`Write a brief summary for a video chapter titled: "${chapter.title}"`);
                if (serverResult.error) throw new Error(serverResult.error);
                result = serverResult.writtenText;
            } else if (action === 'translate') {
                const serverResult = await handleTranslateText(originalText, context!);
                if (serverResult.error) throw new Error(serverResult.error);
                result = serverResult.translatedText;
            }
        }

        if (result) {
            handleSummaryChange(result);
            toast({ title: 'AI Edit Successful', description: `Your text has been updated.` });
        } else {
            throw new Error("The AI didn't return a result.");
        }
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'AI Task Failed', description: e.message });
      }
    });
  };

  const startRecording = async () => {
    setRecordingState(RecordingState.RequestingPermission);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
            setRecordingState(RecordingState.Transcribing);
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                const result = await handleSpeechToText({ audioDataUri: base64Audio });
                if (result.error) {
                    toast({ variant: 'destructive', title: 'Transcription Error', description: result.error });
                } else {
                    const currentSummary = chapter.summary;
                    const newText = result.text || '';
                    const updatedSummary = currentSummary ? `${currentSummary}\n${newText}` : newText;
                    handleSummaryChange(updatedSummary);
                    toast({ title: 'Transcription Added', description: 'Your recorded notes have been added.' });
                }
                setRecordingState(RecordingState.Idle);
            };
        };

        mediaRecorderRef.current.start();
        setRecordingState(RecordingState.Recording);
    } catch (err) {
        toast({ variant: 'destructive', title: 'Microphone Access Denied', description: 'Please allow microphone access in your browser settings.' });
        setRecordingState(RecordingState.Idle);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
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
  
  if (!course) return null;

  return (
    <Card className="h-full border-0 md:border shadow-none md:shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">{course.title}</CardTitle>
        <CardDescription>Edit the details for the selected chapter.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.showChapterTitle && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="space-y-2 col-span-1">
                    <Label htmlFor="timestamp">Timestamp</Label>
                    <Input
                    id="timestamp"
                    name="timestamp"
                    value={chapter.timestamp}
                    onChange={handleChange}
                    placeholder="e.g., 01:23"
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                    id="title"
                    name="title"
                    value={chapter.title}
                    onChange={handleChange}
                    placeholder="e.g., Setting up the project"
                    />
                </div>
            </div>
        )}

        {settings.showNotes && (
        <Tabs defaultValue="edit" className="w-full">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                <Label htmlFor="summary">Chapter Notes</Label>
                <div className="flex items-center gap-2">
                <TabsList className="grid grid-cols-2 h-8">
                    <TabsTrigger value="edit" className='h-6'>Edit</TabsTrigger>
                    <TabsTrigger value="preview" className='h-6'>Preview</TabsTrigger>
                </TabsList>
                {isAiEditing ? <Loader2 className="h-4 w-4 animate-spin"/> : null}
                    {recordingState === RecordingState.Recording ? (
                        <Button size="sm" variant="destructive" onClick={stopRecording}>
                            <Square className="mr-2"/> Stop Recording
                        </Button>
                    ) : (
                         <Button size="sm" variant="outline" onClick={startRecording} disabled={recordingState !== RecordingState.Idle}>
                            {recordingState === RecordingState.Transcribing || recordingState === RecordingState.RequestingPermission
                                ? <Loader2 className="mr-2 animate-spin"/>
                                : <Mic className="mr-2"/>
                            }
                            Record Note
                        </Button>
                    )}
                     <AiEditButton size="sm" variant="ghost" onClick={() => handleAiGeneration('summarize')} disabled={isAiGenerating || !chapterTranscriptText}>
                        <Type className="mr-2"/> Generate Summary
                     </AiEditButton>
                    {chapter.summary && (
                        <>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button size="sm" variant="ghost" disabled={isAiEditing || recordingState !== RecordingState.Idle}>
                                    <Wand2 className="mr-2" /> Writing Tools
                                </Button>
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
                                <AiEditButton size="sm" variant="ghost" disabled={isAiEditing || recordingState !== RecordingState.Idle}>
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
                            <Button variant="ghost" size="icon" className='h-8 w-8' onClick={onAddSnapshot} disabled={!course.videoId}><Camera className="h-4 w-4"/></Button>
                        </div>
                    </div>
                    <Textarea
                        id="summary"
                        name="summary"
                        ref={summaryTextareaRef}
                        value={chapter.summary}
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
                        {chapter.summary ? (
                            <FormattedText text={chapter.summary} onTimestampClick={handleTimestampClick} />
                        ) : (
                            <p className="text-muted-foreground text-sm">Nothing to preview. Add some notes in the edit tab.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        )}

        <Accordion type="single" collapsible>
            <AccordionItem value="transcript">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        no transcipt showing
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <ScrollArea className="h-64 border rounded-md">
                        <div className="p-4 text-sm">
                            {Array.isArray(chapter.transcript) && chapter.transcript.length > 0 ? (
                                chapter.transcript.map((entry: TranscriptEntry, index: number) => (
                                    <p
                                        key={index}
                                        className="cursor-pointer hover:bg-muted p-1 rounded"
                                        onClick={() => handleTimestampClick(entry.offset / 1000)}
                                    >
                                        {entry.text}
                                    </p>
                                ))
                            ) : (
                                <p className="text-muted-foreground">No transcript available for this chapter.</p>
                            )}
                        </div>
                    </ScrollArea>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        {settings.showCodeEditor && (
          <>
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
                        disabled={isRunCodePending || !chapter.code}
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
                        disabled={isCodeExplanationPending || !chapter.code}
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
                value={chapter.code}
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
                            <FormattedText text={fixExplanation} onTimestampClick={handleTimestampClick} />
                        </CardContent>
                    </Card>
                 </div>
            )}

            {chapter.codeExplanation && (
               <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI-Powered Code Explanation
                </Label>
                 <Card className="bg-muted/40">
                   <CardContent className="p-4">
                     <FormattedText text={chapter.codeExplanation} onTimestampClick={handleTimestampClick} />
                   </CardContent>
                 </Card>
               </div>
            )}
          </>
        )}

        {settings.showQuiz && (
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
                            onClick={() => handleAiGeneration('quiz')}
                            disabled={isAiGenerating || !chapterTranscriptText}
                        >
                            {isAiGenerating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Wand2 className="mr-2 h-4 w-4" />
                            )}
                            Generate Quiz
                        </Button>
                    </div>
                </div>

                {chapter.quiz && chapter.quiz.length > 0 ? (
                    <ScrollArea className="h-96 pr-4">
                        <div className="space-y-4">
                            {chapter.quiz.map((q, index) => (
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
        )}

      </CardContent>
    </Card>
  );
}
