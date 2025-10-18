
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

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isGithubDialogOpen, setGithubDialogOpen] = useState(false);
  const [isSearchDialogOpen, setSearchDialogOpen] = useState(false);
  const [isSummaryPending, startSummaryTransition] = useTransition();

  // Effect to auto-select the first chapter when the course chapters change (e.g., after import)
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
  
  const selectedChapter = useMemo(
    () => course.chapters.find(c => c.id === selectedChapterId),
    [course.chapters, selectedChapterId]
  );

  const handleUpdateChapter = (updatedChapter: Chapter) => {
    const newChapters = course.chapters.map(c => (c.id === updatedChapter.id ? updatedChapter : c));
    onCourseUpdate({ ...course, chapters: newChapters });
  };

  const handleSetChapters = (newChapters: Chapter[]) => {
    onCourseUpdate({ ...course, chapters: newChapters });
  }
  
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

  const handleSetCourseData = (updatedData: Partial<Course>) => {
    onCourseUpdate({ ...course, ...updatedData });
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
                onCourseUpdate={handleSetCourseData}
                setSearchDialogOpen={setSearchDialogOpen}
              />
              <ChapterList
                chapters={course.chapters}
                onChaptersUpdate={(newChapters) => handleSetCourseData({ chapters: newChapters })}
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
              {course.videoId ? (
                <VideoPlayer videoId={course.videoId} />
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
          chapters={course.chapters}
          courseTitle={course.title}
        />

        <VideoSearchDialog
          isOpen={isSearchDialogOpen}
          setIsOpen={setSearchDialogOpen}
          onCourseUpdate={handleSetCourseData}
          setSelectedChapterId={setSelectedChapterId}
        />
        
      </SidebarProvider>
    </div>
  );
}
