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
import { Github, FileText, LogOut } from 'lucide-react';
import Header from './Header';
import YoutubeImport from './YoutubeImport';
import ChapterList from './ChapterList';
import ChapterEditor from './ChapterEditor';
import ResumeExportDialog from './ResumeExportDialog';
import GithubExportDialog from './GithubExportDialog';
import type { Chapter } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Loader2 } from 'lucide-react';

const initialChapters: Chapter[] = [
  {
    id: '1',
    timestamp: '00:00',
    title: 'Introduction',
    summary: 'This is an introductory chapter. Replace this with an AI-generated summary.',
    code: 'console.log("Welcome to CodeTube!");',
    transcript: 'Welcome to this course! In this first chapter, we will give you an overview of what to expect. We will cover the basics and set you up for success. Lets get started.',
  },
];

export default function CodeTubeApp() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(initialChapters[0]?.id || null);
  const [isResumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [isGithubDialogOpen, setGithubDialogOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState('My CodeTube Course');

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
            <YoutubeImport setChapters={setChapters} setCourseTitle={setCourseTitle} />
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
          <Button variant="ghost" className="justify-start gap-2" onClick={() => setResumeDialogOpen(true)}>
            <FileText />
            <span className="group-data-[collapsible=icon]:hidden">Export for Résumé</span>
          </Button>
          <Button variant="ghost" className="justify-start gap-2" onClick={handleSignOut}>
            <LogOut />
            <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <main className="flex-1 p-4 md:p-6">
          {selectedChapter ? (
            <ChapterEditor
              key={selectedChapter.id}
              chapter={selectedChapter}
              onUpdateChapter={handleUpdateChapter}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">
                <h2 className="text-xl font-semibold">No Chapter Selected</h2>
                <p>Select a chapter from the sidebar to view or edit its content.</p>
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
      
      <ResumeExportDialog 
        isOpen={isResumeDialogOpen} 
        setIsOpen={setResumeDialogOpen} 
        chapters={chapters} 
      />

      <GithubExportDialog
        isOpen={isGithubDialogOpen}
        setIsOpen={setGithubDialogOpen}
        chapters={chapters}
        courseTitle={courseTitle}
      />
      
    </SidebarProvider>
  );
}
