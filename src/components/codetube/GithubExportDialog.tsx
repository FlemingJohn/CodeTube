'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Github } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleGithubExport } from '@/app/actions';
import type { Chapter } from '@/lib/types';

interface GithubExportDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  chapters: Chapter[];
  courseTitle: string;
}

const formSchema = z.object({
  githubUsername: z.string().min(1, 'GitHub username is required.'),
  repoName: z.string().min(1, 'Repository name is required.').regex(/^[a-zA-Z0-9-._]+$/, 'Invalid repository name.'),
});

export default function GithubExportDialog({ isOpen, setIsOpen, chapters, courseTitle }: GithubExportDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      githubUsername: '',
      repoName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await handleGithubExport({
        ...values,
        chapters,
        courseTitle,
      });

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'GitHub Export Failed',
          description: result.error,
        });
      } else if (result.success) {
        toast({
          title: 'Export Successful!',
          description: (
            <p>
              Successfully created and pushed to{' '}
              <a href={result.success} target="_blank" rel="noopener noreferrer" className="underline">
                your new repository
              </a>
              .
            </p>
          ),
        });
        setIsOpen(false);
        form.reset();
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Github /> Export to GitHub
          </DialogTitle>
          <DialogDescription>
            This will create a new public repository under your GitHub account and push the course content as Markdown files.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="githubUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Username</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., octocat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repoName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Repository Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., my-awesome-course" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create & Push
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
