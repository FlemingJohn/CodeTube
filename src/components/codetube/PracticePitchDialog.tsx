
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
  CheckingPermissions,
  Idle,
  GeneratingScenario,
  ScenarioReady,
  Recording,
  Transcribing,
  FeedbackReady,
}

export default function PracticePitchDialog({ isOpen, setIsOpen, course }: PracticePitchDialogProps) {
  const { toast } = useToast();
  const [pitchState, setPitchState] = useState<PitchState>(PitchState.CheckingPermissions);
  const [scenario, setScenario] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPitchState(PitchState.CheckingPermissions);
      const getMicPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          setHasMicPermission(true);
          setPitchState(PitchState.Idle);
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          console.error('Error accessing microphone:', error);
          setHasMicPermission(false);
          setPitchState(PitchState.Idle);
        }
      };
      getMicPermission();
    }
  }, [isOpen]);

  const onGenerateScenario = async () => {
    if (!hasMicPermission) {
      toast({ variant: 'destructive', title: 'Microphone access is required.' });
      return;
    }
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
    if (!hasMicPermission) {
        toast({ variant: 'destructive', title: 'Microphone permission required.' });
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          const arrayBuffer = await audioBlob.arrayBuffer();
          
          if (!audioContextRef.current) {
            toast({ variant: 'destructive', title: 'Audio processing failed.' });
            return;
          }

          const decodedAudio = await audioContextRef.current.decodeAudioData(arrayBuffer);
          const pcmFloat32 = decodedAudio.getChannelData(0);
          
          // Downsample and convert to 16-bit PCM
          const targetSampleRate = 24000;
          const sourceSampleRate = decodedAudio.sampleRate;
          const ratio = sourceSampleRate / targetSampleRate;
          const newLength = Math.round(pcmFloat32.length / ratio);
          const pcm16 = new Int16Array(newLength);
          let offsetResult = 0;
          let offsetBuffer = 0;

          while (offsetResult < newLength) {
            const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
            let accum = 0, count = 0;
            for (let i = offsetBuffer; i < nextOffsetBuffer && i < pcmFloat32.length; i++) {
                accum += pcmFloat32[i];
                count++;
            }
            pcm16[offsetResult] = Math.max(-1, Math.min(1, accum / count)) * 0x7FFF;
            offsetResult++;
            offsetBuffer = nextOffsetBuffer;
          }
          const pcmBuffer = Buffer.from(pcm16.buffer);
          const base64Audio = pcmBuffer.toString('base64');
          
          setPitchState(PitchState.Transcribing);
          const result = await handleGetPitchFeedback({ scenario, audioDataUri: `data:application/octet-stream;base64,${base64Audio}` });
          if (result.error) {
              toast({ variant: 'destructive', title: 'Error', description: result.error });
              setPitchState(PitchState.ScenarioReady);
          } else if (result.feedback) {
              setFeedback(result.feedback);
              setPitchState(PitchState.FeedbackReady);
          }
          
          audioChunksRef.current = [];
        };
        mediaRecorderRef.current.start();
        setPitchState(PitchState.Recording);
    } catch (err: any) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Could not start recording.', description: 'Please ensure microphone permissions are enabled and try again.'})
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  const reset = () => {
    setPitchState(PitchState.Idle);
    setScenario('');
    setFeedback(null);
  };

  const renderContent = () => {
    switch (pitchState) {
        case PitchState.CheckingPermissions:
            return (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            );
        case PitchState.Idle:
            if (hasMicPermission === false) {
                return (
                    <Alert variant="destructive" className="h-full flex flex-col justify-center">
                       <AlertTitle>Microphone Access Denied</AlertTitle>
                       <AlertDescription>
                           CodeTube needs access to your microphone to record your pitch. Please enable microphone permissions in your browser's site settings and try again.
                       </AlertDescription>
                    </Alert>
                );
            }
            return (
                <div className="flex items-center justify-center h-full">
                    <Button onClick={onGenerateScenario} size="lg" disabled={!hasMicPermission}>
                        <Sparkles className="mr-2" />
                        Generate Interview Scenario
                    </Button>
                </div>
            );
        case PitchState.GeneratingScenario:
            return (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            );
        case PitchState.ScenarioReady:
             return (
                <div className="text-center">
                    <Button onClick={startRecording} size="lg">
                        <Mic className="mr-2" /> Start Recording
                    </Button>
                </div>
             );
        case PitchState.Recording:
            return (
                <div className="text-center">
                    <Button onClick={stopRecording} size="lg" variant="destructive">
                        <Loader2 className="mr-2 animate-spin" /> Stop Recording
                    </Button>
                </div>
            );
        case PitchState.Transcribing:
            return (
                <div className="text-center space-y-4">
                    <p className="text-lg font-semibold">Analyzing your pitch...</p>
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Transcribing audio and generating feedback.</p>
                </div>
            );
        case PitchState.FeedbackReady:
            if (!feedback) return null;
            return (
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
            );
        default:
            return null;
    }
  }


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
