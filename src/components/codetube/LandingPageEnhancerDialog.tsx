
'use client';

import React, { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleSuggestImprovements } from '@/app/actions';

interface LandingPageEnhancerDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function LandingPageEnhancerDialog({
  isOpen,
  setIsOpen,
}: LandingPageEnhancerDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [htmlContent, setHtmlContent] = useState('');
  const [suggestions, setSuggestions] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Get the outer HTML of the entire document
      setHtmlContent(document.documentElement.outerHTML);
      // Automatically trigger suggestions when dialog opens
      onGetSuggestions();
    }
  }, [isOpen]);
  
  const onGetSuggestions = () => {
    startTransition(async () => {
      setSuggestions(''); // Clear previous suggestions
      const content = document.documentElement.outerHTML;
      if (!content) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not get page content.',
        });
        return;
      }

      const result = await handleSuggestImprovements({ htmlContent: content });
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else if (result.suggestions) {
        setSuggestions(result.suggestions);
        toast({
          title: 'Suggestions Ready',
          description: 'AI-powered improvements have been generated.',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Landing Page Enhancer</DialogTitle>
          <DialogDescription>
            Here are AI-powered suggestions for improving this landing page based on its current content.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isPending && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
              <p>Analyzing page...</p>
            </div>
          )}
          {suggestions && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2 flex items-center">
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    AI Suggestions
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-lg bg-muted/40 p-4">
                  {suggestions}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

    