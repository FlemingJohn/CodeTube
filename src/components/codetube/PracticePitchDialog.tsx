
'use client';

import React, { useState, useTransition, useRef, useEffect } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface PracticePitchDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  course: Course;
}

type Feedback = {
  transcribedAnswer: string;
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
  Recording,
  Transcribing,
  FeedbackReady,
}

export default function PracticePitchDialog({ isOpen, setIsOpen, course }: PracticePitchDialogProps) {
  const { toast } = useToast();
  const [pitchState, setPitchState] = useState<PitchState>(PitchState.Idle);
  const [scenario, setScenario] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen) {
      const getCameraPermission = async () => {
        try {
          // We only need audio, but this triggers the browser permission prompt
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          setHasCameraPermission(true);
          // We can immediately stop the tracks as we don't need to keep the stream open yet
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          console.error('Error accessing microphone:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Microphone Access Denied',
            description: 'Please enable microphone permissions in your browser settings to use this feature.',
          });
        }
      };
      getCameraPermission();
    }
  }, [isOpen, toast]);

  const onGenerateScenario = async () => {
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
  };

  const startRecording = async () => {
    if (!hasCameraPermission) {
        toast({ variant: 'destructive', title: 'Microphone permission required.' });
        return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        setPitchState(PitchState.Transcribing);
        const result = await handleGetPitchFeedback({ scenario, audioDataUri: base64Audio });
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
            setPitchState(PitchState.ScenarioReady);
        } else if (result.feedback) {
            setFeedback(result.feedback);
            setPitchState(PitchState.FeedbackReady);
        }
      };
      audioChunksRef.current = [];
    };
    mediaRecorderRef.current.start();
    setPitchState(PitchState.Recording);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
       // Stop all media tracks to turn off the microphone indicator
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  const reset = () => {
    setPitchState(PitchState.Idle);
    setScenario('');
    setFeedback(null);
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
            Hone your interview skills by practicing your response to an AI-generated scenario.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-4 -mr-4">
          {!hasCameraPermission && hasCameraPermission !== null && (
             <Alert variant="destructive">
                <AlertTitle>Microphone Access Required</AlertTitle>
                <AlertDescription>
                    Please allow microphone access in your browser to use this feature.
                </AlertDescription>
             </Alert>
          )}

          {pitchState === PitchState.Idle && (
            <div className="flex items-center justify-center h-full">
              <Button onClick={onGenerateScenario} size="lg" disabled={!hasCameraPermission}>
                <Sparkles className="mr-2" />
                Generate Interview Scenario
              </Button>
            </div>
          )}
          
          {(pitchState === PitchState.GeneratingScenario) && (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}

          {(pitchState >= PitchState.ScenarioReady) && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="font-semibold text-lg">Your Scenario:</p>
                <p className="text-foreground/80">{scenario}</p>
              </CardContent>
            </Card>
          )}

          {pitchState === PitchState.ScenarioReady && (
            <div className="text-center">
              <Button onClick={startRecording} size="lg">
                <Mic className="mr-2" /> Start Recording
              </Button>
            </div>
          )}

          {pitchState === PitchState.Recording && (
            <div className="text-center">
              <Button onClick={stopRecording} size="lg" variant="destructive">
                <Loader2 className="mr-2 animate-spin" /> Stop Recording
              </Button>
            </div>
          )}

          {pitchState === PitchState.Transcribing && (
             <div className="text-center space-y-4">
                <p className="text-lg font-semibold">Analyzing your pitch...</p>
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Transcribing audio and generating feedback.</p>
            </div>
          )}

          {pitchState === PitchState.FeedbackReady && feedback && (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-4">
                        <p className="font-semibold text-lg mb-2">Your Answer:</p>
                        <p className="text-foreground/80 italic">"{feedback.transcribedAnswer}"</p>
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
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
