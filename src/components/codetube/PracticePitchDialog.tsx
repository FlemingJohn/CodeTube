
'use client';

import React, { useState, useTransition, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, Bot, Sparkles, CheckCircle, XCircle, MicOff, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleGeneratePitchScenario, handleGetPitchFeedback, handleSpeechToText } from '@/app/actions';
import type { Course } from '@/lib/types';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { GetPitchFeedbackOutput } from '@/ai/flows/get-pitch-feedback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


interface PracticePitchDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  course: Course;
}

enum PitchState {
  Idle,
  GeneratingScenario,
  ScenarioReady,
  GettingFeedback,
  FeedbackReady,
}

enum RecordingState {
    Idle,
    RequestingPermission,
    Recording,
    Transcribing,
}

export default function PracticePitchDialog({ isOpen, setIsOpen, course }: PracticePitchDialogProps) {
  const { toast } = useToast();
  const [pitchState, setPitchState] = useState<PitchState>(PitchState.Idle);
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.Idle);
  const [scenario, setScenario] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<GetPitchFeedbackOutput | null>(null);
  const [getFeedbackPending, startGetFeedbackTransition] = useTransition();
  const [generateScenarioPending, startGenerateScenarioTransition] = useTransition();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const startRecording = async () => {
    setRecordingState(RecordingState.RequestingPermission);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
            setRecordingState(RecordingState.Transcribing);
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                const result = await handleSpeechToText({ audioDataUri: base64Audio });
                if (result.error) {
                    toast({ variant: 'destructive', title: 'Transcription Error', description: result.error });
                    setRecordingState(RecordingState.Idle);
                } else {
                    setUserAnswer(result.text || '');
                    setRecordingState(RecordingState.Idle);
                }
            };
        };

        mediaRecorderRef.current.start();
        setRecordingState(RecordingState.Recording);
    } catch (err) {
        toast({ variant: 'destructive', title: 'Microphone Access Denied', description: 'Please allow microphone access in your browser settings.' });
        setRecordingState(RecordingState.Idle);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
  };


  const onSubmitAnswer = () => {
    if (!userAnswer) {
      toast({
        variant: 'destructive',
        title: 'Please provide an answer first.',
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
    setRecordingState(RecordingState.Idle);
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
             <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Type Answer</TabsTrigger>
                    <TabsTrigger value="speech">Speak Answer</TabsTrigger>
                </TabsList>
                <TabsContent value="text">
                    <Textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your response here..."
                        rows={8}
                    />
                </TabsContent>
                <TabsContent value="speech">
                    <div className="flex flex-col items-center justify-center gap-4 rounded-md border min-h-[180px] p-4">
                        {recordingState === RecordingState.Recording ? (
                            <>
                                <Button onClick={stopRecording} variant="destructive" size="lg">
                                    <Square className="mr-2" /> Stop Recording
                                </Button>
                                <p className="text-sm text-muted-foreground">Recording in progress...</p>
                            </>
                        ) : recordingState === RecordingState.Transcribing || recordingState === RecordingState.RequestingPermission ? (
                             <>
                                <Button disabled size="lg">
                                    <Loader2 className="mr-2 animate-spin" /> 
                                    {recordingState === RecordingState.Transcribing ? "Transcribing..." : "Please wait..."}
                                </Button>
                                <p className="text-sm text-muted-foreground">{recordingState === RecordingState.Transcribing ? "Converting your speech to text." : "Requesting microphone access."}</p>
                            </>
                        ) : (
                            <Button onClick={startRecording} size="lg">
                                <Mic className="mr-2" /> Start Recording
                            </Button>
                        )}
                    </div>
                     {userAnswer && (
                        <Card className="mt-4 bg-muted/30">
                            <CardContent className="p-3">
                                <p className="text-sm font-semibold mb-1">Transcribed Answer:</p>
                                <p className="text-sm text-muted-foreground italic">"{userAnswer}"</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            <Button onClick={onSubmitAnswer} disabled={getFeedbackPending || !userAnswer} className="w-full">
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
              <CardContent className="p-4 space-y-2">
                <p className="font-semibold text-lg">Your Answer:</p>
                <p className="text-foreground/80 italic">"{userAnswer}"</p>
                {feedback.translation?.translatedAnswer && (
                    <div className="pt-2 border-t mt-3">
                        <p className="text-sm font-semibold">Translation ({feedback.translation.detectedLanguage} to English):</p>
                        <p className="text-sm text-muted-foreground italic">"{feedback.translation.translatedAnswer}"</p>
                    </div>
                )}
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
            Hone your interview skills by responding to an AI-generated scenario. You can type or record your answer.
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
