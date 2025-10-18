
'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarRail
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Github, LogOut, Sparkles, Loader2, Tag } from 'lucide-react';
import Header from './Header';
import YoutubeImport from './YoutubeImport';
import ChapterList from './ChapterList';
import ChapterEditor from './ChapterEditor';
import GithubExportDialog from './GithubExportDialog';
import type { Chapter, Course, CourseCategory } from '@/lib/types';
import { COURSE_CATEGORIES } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import VideoPlayer from './VideoPlayer';
import VideoSearchDialog from './VideoSearchDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { handleGenerateSummary } from '@/app/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface CreatorStudioProps {
    course: Course;
    onCourseUpdate: (course: Course) => void;
    onBackToDashboard: () => void;
    isNewCourse: boolean;
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

export default function CreatorStudio({ course, onCourseUpdate, onBackToDashboard, isNewCourse }: CreatorStudioProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [playingChapterId, setPlayingChapterId] = useState<string | null>(null);
  const [isGithubDialogOpen, setGithubDialogOpen] = useState(false);
  const [isSearchDialogOpen, setSearchDialogOpen] = useState(false);
  const [isSummaryPending, startSummaryTransition] = useTransition();
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
    if (isNewCourse) {
      setSearchDialogOpen(true);
    }
  }, [isNewCourse]);

  const chapterStartTimes = useMemo(() => {
    return course.chapters.map(chapter => ({
      id: chapter.id,
      startTime: timestampToSeconds(chapter.timestamp),
    })).sort((a, b) => a.startTime - b.startTime);
  }, [course.chapters]);

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
  
  const selectedChapter = useMemo(
    () => course.chapters.find(c => c.id === selectedChapterId),
    [course.chapters, selectedChapterId]
  );

  const handleUpdateChapter = (updatedChapter: Chapter) => {
    const newChapters = course.chapters.map(c => (c.id === updatedChapter.id ? updatedChapter : c));
    onCourseUpdate({ ...course, chapters: newChapters });
  };
  
  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedChapter) return;
    const updatedChapter = { ...selectedChapter, summary: e.target.value };
    handleUpdateChapter(updatedChapter);
  };

  const onGenerateSummary = () => {
    if (!selectedChapter) return;
    startSummaryTransition(async () => {
      const result = await handleGenerateSummary({ 
        transcript: selectedChapter.transcript,
        chapterTitle: selectedChapter.title,
      });
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else if (result.summary) {
        const updatedChapter = { ...selectedChapter, summary: result.summary };
        handleUpdateChapter(updatedChapter);
        toast({
          title: 'Summary Generated',
          description: 'The AI-powered summary has been added.',
        });
      }
    });
  };

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

  const handleChapterSelect = (chapter: Chapter) => {
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

          <SidebarContent className='overflow-auto'>
            <div className="flex flex-col gap-4 p-2">
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
                onChaptersUpdate={(newChapters) => onCourseUpdate({ ...course, chapters: newChapters })}
                selectedChapterId={selectedChapterId}
                playingChapterId={playingChapterId}
                onChapterSelect={handleChapterSelect}
              />
            </div>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
            <header className="flex items-center justify-between p-2 border-b">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={onBackToDashboard}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      My Courses
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
          <main className="flex-1 p-4 md:p-6 bg-muted/20 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-auto">
            <div className="flex flex-col gap-6">
              {course.videoId ? (
                <VideoPlayer videoId={course.videoId} onReady={onPlayerReady} />
              ) : (
                <div className="flex-grow flex aspect-video h-full items-center justify-center rounded-lg border-2 border-dashed border-muted bg-background">
                  <div className="text-center text-muted-foreground">
                    <h2 className="text-xl font-semibold">No Video Imported</h2>
                    <p>Import a YouTube video to get started.</p>
                  </div>
                </div>
              )}
               {selectedChapter && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                      <Sparkles className="w-6 h-6 text-primary" />
                      Take notes
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={onGenerateSummary} disabled={isSummaryPending}>
                        {isSummaryPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate Notes
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                        id="summary"
                        name="summary"
                        value={selectedChapter.summary}
                        onChange={handleSummaryChange}
                        placeholder="Click 'Generate Notes' to get an AI summary or write your own notes here."
                        rows={8}
                        className="text-base"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="flex flex-col">
              {selectedChapter ? (
                <div className="h-full overflow-y-auto">
                  <ChapterEditor
                    key={selectedChapter.id}
                    chapter={selectedChapter}
                    onUpdateChapter={handleUpdateChapter}
                    courseTitle={course.title}
                  />
                </div>
              ) : (
                <div className="flex-grow flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted bg-background">
                  <div className="text-center text-muted-foreground">
                    <h2 className="text-xl font-semibold">No Chapter Selected</h2>
                    <p>Select a chapter from the list to edit its details.</p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
        
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
        
      </SidebarProvider>
    </div>
  );
}
