
'use client';

import React, { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, Bot, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleGeneratePitchScenario, handleGetPitchFeedback } from '@/app/actions';
import type { Course } from '@/lib/types';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface PracticePitchDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  course: Course;
}

type Feedback = {
  overallFeedback: string;
  feedbackBreakdown: {
    isPositive: boolean;
    feedback: string;
  }[];
};

enum PitchState {
  Idle,
  GeneratingScenario,
  ScenarioReady,
  GettingFeedback,
  FeedbackReady,
}

export default function PracticePitchDialog({ isOpen, setIsOpen, course }: PracticePitchDialogProps) {
  const { toast } = useToast();
  const [pitchState, setPitchState] = useState<PitchState>(PitchState.Idle);
  const [scenario, setScenario] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [getFeedbackPending, startGetFeedbackTransition] = useTransition();
  const [generateScenarioPending, startGenerateScenarioTransition] = useTransition();

  const onGenerateScenario = async () => {
    startGenerateScenarioTransition(async () => {
      setPitchState(PitchState.GeneratingScenario);
      const courseContent = course.chapters
        .map(c => `Chapter: ${c.title}\nSummary: ${c.summary}`)
        .join('\n\n');

      const result = await handleGeneratePitchScenario({
        courseTitle: course.title,
        courseContent,
      });

      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        setPitchState(PitchState.Idle);
      } else {
        setScenario(result.scenario);
        setPitchState(PitchState.ScenarioReady);
      }
    });
  };

  const onSubmitAnswer = () => {
    if (!userAnswer) {
      toast({
        variant: 'destructive',
        title: 'Please enter your answer.',
      });
      return;
    }
    startGetFeedbackTransition(async () => {
      setPitchState(PitchState.GettingFeedback);
      const result = await handleGetPitchFeedback({ scenario, userAnswer });

      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        setPitchState(PitchState.ScenarioReady);
      } else if (result.feedback) {
        setFeedback(result.feedback);
        setPitchState(PitchState.FeedbackReady);
      }
    });
  };

  const reset = () => {
    setPitchState(PitchState.Idle);
    setScenario('');
    setUserAnswer('');
    setFeedback(null);
  };
  
  const renderContent = () => {
    switch (pitchState) {
      case PitchState.Idle:
        return (
          <div className="flex items-center justify-center h-full">
            <Button onClick={onGenerateScenario} size="lg" disabled={generateScenarioPending}>
              {generateScenarioPending ? (
                <Loader2 className="mr-2 animate-spin" />
              ) : (
                <Sparkles className="mr-2" />
              )}
              Generate Interview Scenario
            </Button>
          </div>
        );
      case PitchState.GeneratingScenario:
        return (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Generating your scenario...</p>
          </div>
        );
      case PitchState.ScenarioReady:
        return (
          <div className="space-y-4">
            <p className="font-semibold text-lg">Your Answer:</p>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your response here..."
              rows={8}
            />
            <Button onClick={onSubmitAnswer} disabled={getFeedbackPending || !userAnswer}>
              {getFeedbackPending ? (
                <Loader2 className="mr-2 animate-spin" />
              ) : null}
              Get Feedback
            </Button>
          </div>
        );
      case PitchState.GettingFeedback:
        return (
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold">Analyzing your pitch...</p>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Generating feedback.</p>
          </div>
        );
      case PitchState.FeedbackReady:
        if (!feedback) return null;
        return (
          <div className="space-y-6">
             <Card>
              <CardContent className="p-4">
                <p className="font-semibold text-lg">Your Answer:</p>
                <p className="text-foreground/80 italic">"{userAnswer}"</p>
              </CardContent>
            </Card>

            <Card className="border-primary/50">
              <CardContent className="p-4">
                <p className="font-semibold text-lg mb-2 flex items-center gap-2"><Bot className="w-5 h-5 text-primary" /> Overall Feedback:</p>
                <p className="text-foreground/90">{feedback.overallFeedback}</p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {feedback.feedbackBreakdown.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  {item.isPositive ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  )}
                  <p className="flex-1">{item.feedback}</p>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button onClick={reset} variant="outline">Practice Again</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) reset();
      setIsOpen(open);
    }}>
      <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Mic /> Practice Your Pitch
          </DialogTitle>
          <DialogDescription>
            Hone your interview skills by responding to an AI-generated scenario.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-4 -mr-4">
          {scenario && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="font-semibold text-lg">Your Scenario:</p>
                <p className="text-foreground/80">{scenario}</p>
              </CardContent>
            </Card>
          )}

          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
