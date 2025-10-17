
'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Github, LogOut, Sparkles, Loader2 } from 'lucide-react';
import Header from './Header';
import YoutubeImport from './YoutubeImport';
import ChapterList from './ChapterList';
import ChapterEditor from './ChapterEditor';
import GithubExportDialog from './GithubExportDialog';
import type { Chapter, Course } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import VideoPlayer from './VideoPlayer';
import VideoSearchDialog from './VideoSearchDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { handleGenerateSummary } from '@/app/actions';

interface CreatorStudioProps {
    course: Course;
    onCourseUpdate: (course: Course) => void;
    onBackToDashboard: () => void;
    isNewCourse: boolean;
}

export default function CreatorStudio({ course, onCourseUpdate, onBackToDashboard, isNewCourse }: CreatorStudioProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  const [chapters, setChapters] = useState<Chapter[]>(course.chapters);
  const [courseTitle, setCourseTitle] = useState(course.title);
  const [videoId, setVideoId] = useState<string | null>(course.videoId);

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(course.chapters[0]?.id || null);
  const [isGithubDialogOpen, setGithubDialogOpen] = useState(false);
  const [isSearchDialogOpen, setSearchDialogOpen] = useState(false);
  const [isSummaryPending, startSummaryTransition] = useTransition();

  useEffect(() => {
    // This effect ensures that if the user selects a different course from the dashboard,
    // or if the course data is updated from an import, the editor's state updates.
    setCourseTitle(course.title);
    setChapters(course.chapters);
    setVideoId(course.videoId);
  }, [course]);
  
  useEffect(() => {
      // This effect ensures that after a new video is imported (and chapters are populated),
      // the first chapter is automatically selected.
      if (course.chapters.length > 0) {
          setSelectedChapterId(course.chapters[0].id);
      } else {
          setSelectedChapterId(null);
      }
  }, [course.chapters]);

  useEffect(() => {
    if (isNewCourse) {
      setSearchDialogOpen(true);
    }
  }, [isNewCourse]);

  // This is the function that will be called to update the parent
  const updateParentCourse = (updatedData: Partial<Course>) => {
    const updatedCourse = {
        ...course,
        title: courseTitle,
        chapters,
        videoId,
        ...updatedData,
    };
    onCourseUpdate(updatedCourse);
  };
  
  const handleSetVideoId = (newVideoId: string | null) => {
    setVideoId(newVideoId);
    updateParentCourse({ videoId: newVideoId });
  };
  
  const handleSetCourseTitle = (newTitle: string) => {
    setCourseTitle(newTitle);
    updateParentCourse({ title: newTitle });
  };

  const handleSetChapters = (newChapters: Chapter[] | ((prev: Chapter[]) => Chapter[])) => {
    const updatedChapters = typeof newChapters === 'function' ? newChapters(chapters) : newChapters;
    setChapters(updatedChapters);
    updateParentCourse({ chapters: updatedChapters });
  };

  const selectedChapter = useMemo(
    () => chapters.find(c => c.id === selectedChapterId),
    [chapters, selectedChapterId]
  );

  const handleUpdateChapter = (updatedChapter: Chapter) => {
    const newChapters = chapters.map(c => (c.id === updatedChapter.id ? updatedChapter : c));
    handleSetChapters(newChapters);
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

  return (
    <div className="h-screen bg-background">
      <SidebarProvider
        defaultOpen={true}
        collapsible="icon"
        style={{ '--sidebar-width': '25rem' } as React.CSSProperties}
      >
        <Sidebar>
          <SidebarHeader>
            <Header />
          </SidebarHeader>

          <SidebarContent>
            <div className="flex flex-col gap-4 p-2">
              <YoutubeImport 
                setChapters={handleSetChapters}
                setCourseTitle={handleSetCourseTitle}
                setSelectedChapterId={setSelectedChapterId}
                setVideoId={handleSetVideoId}
                setSearchDialogOpen={setSearchDialogOpen}
              />
              <ChapterList
                chapters={chapters}
                setChapters={handleSetChapters}
                selectedChapterId={selectedChapterId}
                setSelectedChapterId={setSelectedChapterId}
              />
            </div>
          </SidebarContent>

          <SidebarFooter className="p-2">
            <Button variant="ghost" className="justify-start gap-2" onClick={onBackToDashboard}>
              <ArrowLeft />
              <span className="group-data-[collapsible=icon]:hidden">My Courses</span>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" onClick={() => setGithubDialogOpen(true)}>
              <Github />
              <span className="group-data-[collapsible=icon]:hidden">Export to GitHub</span>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" onClick={handleSignOut}>
              <LogOut />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <main className="flex-1 p-4 md:p-6 bg-muted/20 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              {videoId ? (
                <VideoPlayer videoId={videoId} />
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
          chapters={chapters}
          courseTitle={courseTitle}
        />

        <VideoSearchDialog
          isOpen={isSearchDialogOpen}
          setIsOpen={setSearchDialogOpen}
          setChapters={handleSetChapters}
          setCourseTitle={handleSetCourseTitle}
          setSelectedChapterId={setSelectedChapterId}
          setVideoId={handleSetVideoId}
        />
        
      </SidebarProvider>
    </div>
  );
}
