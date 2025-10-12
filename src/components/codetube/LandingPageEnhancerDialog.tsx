'use client';

import React, { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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

  const onGetSuggestions = () => {
    startTransition(async () => {
      setSuggestions('');
      const result = await handleSuggestImprovements({ htmlContent });
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
            Paste your landing page content (HTML) below and get AI-powered suggestions for improvement.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Paste your landing page HTML here..."
            rows={10}
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
          />
          <Button onClick={onGetSuggestions} disabled={isPending || !htmlContent}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BrainCircuit className="mr-2 h-4 w-4" />
            )}
            Suggest Improvements
          </Button>
          {suggestions && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">Suggestions:</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
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
