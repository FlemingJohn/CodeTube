'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Github, LogOut } from 'lucide-react';
import Header from './Header';
import YoutubeImport from './YoutubeImport';
import ChapterList from './ChapterList';
import ChapterEditor from './ChapterEditor';
import GithubExportDialog from './GithubExportDialog';
import type { Chapter } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Loader2 } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import VideoSearchDialog from './VideoSearchDialog';

export default function CodeTubeApp() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isGithubDialogOpen, setGithubDialogOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState('My CodeTube Course');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isSearchDialogOpen, setSearchDialogOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const selectedChapter = useMemo(
    () => chapters.find(c => c.id === selectedChapterId),
    [chapters, selectedChapterId]
  );

  const handleUpdateChapter = (updatedChapter: Chapter) => {
    setChapters(prevChapters =>
      prevChapters.map(c => (c.id === updatedChapter.id ? updatedChapter : c))
    );
  };

  const handleSignOut = async () => {
    await signOut(auth);
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    router.push('/');
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
                setChapters={setChapters} 
                setCourseTitle={setCourseTitle} 
                setSelectedChapterId={setSelectedChapterId}
                setVideoId={setVideoId}
                setSearchDialogOpen={setSearchDialogOpen}
              />
              <ChapterList
                chapters={chapters}
                setChapters={setChapters}
                selectedChapterId={selectedChapterId}
                setSelectedChapterId={setSelectedChapterId}
              />
            </div>
          </SidebarContent>

          <SidebarFooter className="p-2">
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
          setChapters={setChapters}
          setCourseTitle={setCourseTitle}
          setSelectedChapterId={setSelectedChapterId}
          setVideoId={setVideoId}
        />
        
      </SidebarProvider>
    </div>
  );
}
