
'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Github, LogOut, Sparkles, Loader2, Tag, Bot, Share2, BookUser, RefreshCw } from 'lucide-react';
import Header from './Header';
import YoutubeImport from './YoutubeImport';
import ChapterList from './ChapterList';
import ChapterEditor from './ChapterEditor';
import GithubExportDialog from './GithubExportDialog';
import ShareDialog from './ShareDialog';
import type { Chapter, Course, CourseCategory, InterviewQuestion } from '@/lib/types';
import { COURSE_CATEGORIES } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import VideoPlayer from './VideoPlayer';
import VideoSearchDialog from './VideoSearchDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { handleGenerateInterviewQuestions } from '@/app/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ScrollArea } from '../ui/scroll-area';
import { updateCourse } from '@/lib/courses';
import Link from 'next/link';

interface CreatorStudioProps {
    course: Course;
    onBackToDashboard: () => void;
}

const timestampToSeconds = (ts: string) => {
    const parts = ts.split(':').map(Number);
    if (parts.length === 3) { // hh:mm:ss
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) { // mm:ss
        return parts[0] * 60 + parts[1];
    }
    return 0;
};
  
const FormattedAnswer = ({ text }: { text: string }) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = text.split(codeBlockRegex);
  
    return (
      <div className="space-y-4">
        {parts.map((part, index) => {
          if (index % 3 === 2) { 
            return (
              <Card key={index} className="bg-background/50 my-4 shadow-inner">
                <CardContent className="p-4">
                  <pre className="font-code text-sm overflow-x-auto">
                    <code>{part.trim()}</code>
                  </pre>
                </CardContent>
              </Card>
            );
          }
          if (index % 3 === 0 && part.trim()) {
            return (
              <div key={index}>
                {part.trim().split('\n').map((paragraph, pIndex) => (
                  <p key={pIndex} className="mb-2 last:mb-0">{paragraph}</p>
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
};

export default function CreatorStudio({ course: initialCourse, onBackToDashboard }: CreatorStudioProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const [course, setCourse] = useState(initialCourse);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [playingChapterId, setPlayingChapterId] = useState<string | null>(null);
  const [isGithubDialogOpen, setGithubDialogOpen] = useState(false);
  const [isSearchDialogOpen, setSearchDialogOpen] = useState(false);
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [isInterviewPending, startInterviewTransition] = useTransition();
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    if (course.chapters.length > 0) {
      if (!selectedChapterId || !course.chapters.some(c => c.id === selectedChapterId)) {
        setSelectedChapterId(course.chapters[0].id);
      }
    } else {
      setSelectedChapterId(null);
    }
  }, [course.chapters, selectedChapterId]);

  useEffect(() => {
    if (!initialCourse.videoId) {
      setSearchDialogOpen(true);
    }
  }, [initialCourse.videoId]);

  const onCourseUpdate = (updatedCourse: Course) => {
    setCourse(updatedCourse);
    updateCourse(firestore, updatedCourse.userId, updatedCourse.id, updatedCourse);
  };

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
        
            for (let i = chapterStartTimes.length - 1; i >= 0; i--) {
                if (currentTime >= chapterStartTimes[i].startTime) {
                    activeChapterId = chapterStartTimes[i].id;
                    break;
                }
            }
        
            setPlayingChapterId(activeChapterId);
        } catch (e) {
            clearInterval(interval);
        }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [player, chapterStartTimes]);

  const handleUpdateChapter = (updatedChapter: Chapter) => {
    const newChapters = course.chapters.map(c => (c.id === updatedChapter.id ? updatedChapter : c));
    onCourseUpdate({ ...course, chapters: newChapters });
  };

  const onGenerateInterviewQuestions = (replace: boolean = false) => {
    if (!selectedChapter || !selectedChapter.transcript) {
        toast({ variant: 'destructive', title: 'Missing context', description: 'This chapter needs a transcript to generate questions.' });
        return;
    }
    startInterviewTransition(async () => {
        const result = await handleGenerateInterviewQuestions({
            transcript: selectedChapter.transcript,
            chapterTitle: selectedChapter.title,
        });

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else if (result.questions) {
            const existingQuestions = replace ? [] : (selectedChapter.interviewQuestions || []);
            const updatedChapter = { 
                ...selectedChapter, 
                interviewQuestions: [...existingQuestions, ...result.questions] 
            };
            handleUpdateChapter(updatedChapter);
            toast({ title: 'Interview questions generated!' });
        }
    });
  }

  const handleSignOut = async () => {
    await signOut(auth);
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    router.push('/');
  };

  const onPlayerReady = (event: any) => {
    setPlayer(event.target);
  };

  const handleChapterSelect = (chapter: Chapter | null) => {
    if (!chapter) {
        setSelectedChapterId(null);
        return;
    }
    setSelectedChapterId(chapter.id);
    if (player) {
      const seekTime = timestampToSeconds(chapter.timestamp);
      player.seekTo(seekTime);
      player.playVideo();
    }
  }

  const handleCategoryChange = (category: CourseCategory) => {
    onCourseUpdate({ ...course, category });
  }

  return (
    <div className="h-screen bg-background">
      <SidebarProvider
        defaultOpen={true}
        collapsible="icon"
      >
        <Sidebar>
            <SidebarRail />
          <SidebarHeader>
            <Header />
          </SidebarHeader>

          <SidebarContent className="flex-1 flex flex-col">
            <div className="flex flex-col gap-4 p-2 h-full">
              <YoutubeImport 
                onCourseUpdate={(update) => onCourseUpdate({ ...course, ...update })}
                setSearchDialogOpen={setSearchDialogOpen}
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1 text-sm font-medium text-muted-foreground">
                  <Tag className="w-5 h-5"/>
                  <span>Category</span>
                </div>
                <Select 
                  value={course.category || 'General'} 
                  onValueChange={(value) => handleCategoryChange(value as CourseCategory)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ChapterList
                chapters={course.chapters}
                videoId={course.videoId}
                onChaptersUpdate={(newChapters) => onCourseUpdate({ ...course, chapters: newChapters })}
                selectedChapterId={selectedChapterId}
                playingChapterId={playingChapterId}
                onChapterSelect={handleChapterSelect}
              />

              <div className="mt-auto">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link href="/creator/course-mentor" className='w-full'>
                            <SidebarMenuButton>
                                <BookUser />
                                <span>Course Mentor</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between p-2 border-b">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={onBackToDashboard}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      My Courses
                    </Button>
                     <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setGithubDialogOpen(true)}>
                        <Github className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                     <Button variant="ghost" size="sm" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </header>
          <main className="flex-1 bg-muted/20 overflow-auto">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={50}>
                <ScrollArea className="h-full">
                  <div className="flex flex-col gap-6 p-4 md:p-6">
                    {course.videoId ? (
                      <VideoPlayer videoId={course.videoId} onReady={onPlayerReady} />
                    ) : (
                      <div className="flex-grow flex aspect-video h-full items-center justify-center rounded-lg border-2 border-dashed border-muted bg-background">
                        <div className="text-center text-muted-foreground">
                          <h2 className="text-xl font-semibold">No Video Imported</h2>
                          <p>Click the "Search" button to find a video.</p>
                        </div>
                      </div>
                    )}
                    {selectedChapter && (
                      <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                                    <Bot className="w-6 h-6 text-primary" />
                                    Interview Prep
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  {selectedChapter.interviewQuestions && selectedChapter.interviewQuestions.length > 0 && (
                                    <Button size="sm" variant="outline" onClick={() => onGenerateInterviewQuestions(true)} disabled={isInterviewPending}>
                                      <RefreshCw className="mr-2"/> Regenerate
                                    </Button>
                                  )}
                                  <Button size="sm" onClick={() => onGenerateInterviewQuestions(false)} disabled={isInterviewPending}>
                                    {isInterviewPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2"/>}
                                    Generate
                                  </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isInterviewPending && (!selectedChapter.interviewQuestions || selectedChapter.interviewQuestions.length === 0) ? (
                                    <div className="text-center text-sm text-muted-foreground py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2"/>
                                        <p>Generating interview questions...</p>
                                    </div>
                                ) : selectedChapter.interviewQuestions && selectedChapter.interviewQuestions.length > 0 ? (
                                    <Accordion type="single" collapsible className="w-full space-y-2">
                                        {selectedChapter.interviewQuestions.map((item, index) => (
                                            <AccordionItem key={index} value={`item-${index}`} className="bg-background/50 rounded-md border px-4">
                                                <AccordionTrigger className="text-left hover:no-underline">
                                                    <div className="flex items-start gap-4">
                                                        <span className="text-lg font-bold text-primary mt-1">{index + 1}.</span>
                                                        <span className="flex-1">{item.question}</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="text-base prose prose-sm dark:prose-invert max-w-none pt-2">
                                                    <FormattedAnswer text={item.answer} />
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                ) : (
                                <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                                    <p>No interview questions for this chapter yet.</p>
                                    <p>Click "Generate" to create some.</p>
                                </div>
                                )}
                            </CardContent>
                        </Card>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div className="h-full overflow-y-auto">
                  {selectedChapter ? (
                    <ChapterEditor
                      key={selectedChapter.id}
                      chapter={selectedChapter}
                      onUpdateChapter={handleUpdateChapter}
                      courseTitle={course.title}
                    />
                  ) : (
                    <div className="flex-grow flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted bg-background m-4">
                      <div className="text-center text-muted-foreground">
                        <h2 className="text-xl font-semibold">No Chapter Selected</h2>
                        <p>Select a chapter from the list to edit its details.</p>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </main>
        </div>
        
        <GithubExportDialog
          isOpen={isGithubDialogOpen}
          setIsOpen={setGithubDialogOpen}
          chapters={course.chapters}
          courseTitle={course.title}
        />

        <VideoSearchDialog
          isOpen={isSearchDialogOpen}
          setIsOpen={setSearchDialogOpen}
          onCourseUpdate={(update) => onCourseUpdate({ ...course, ...update })}
        />

        <ShareDialog
          isOpen={isShareDialogOpen}
          setIsOpen={setShareDialogOpen}
          course={course}
        />
        
      </SidebarProvider>
    </div>
  );
}
