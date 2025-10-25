
'use client';

import { useState, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Search, ArrowLeft, Youtube, Sparkles, Lightbulb, BookCopy, GitBranch, ChevronsRight, Award, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/codetube/Header';
import AuthHeader from '@/components/auth/AuthHeader';
import Link from 'next/link';
import { handleGenerateLearningPlan, getYoutubeChapters, handleCompareVideos } from '@/app/actions';
import Image from 'next/image';
import { Course } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { addCourse } from '@/lib/courses';
import { LearningPlan, VideoSuggestion } from '@/ai/flows/generate-learning-plan';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { useChromeAi } from '@/hooks/useChromeAi';


export default function CourseMentorPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isGenerating, startGenerationTransition] = useTransition();
  const [isImporting, startImportTransition] = useTransition();

  const [topic, setTopic] = useState('');
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  
  const [videosToCompare, setVideosToCompare] = useState<{[step: number]: string[]}>({});
  const [comparisonResults, setComparisonResults] = useState<{[step: number]: string}>({});
  const [isComparing, startComparisonTransition] = useTransition();
  const autoplayPlugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));
  const { aiAvailable, improvePrompt } = useChromeAi();
  const [isImprovingPrompt, startImprovePromptTransition] = useTransition();


  const handleGenerate = () => {
    if (!topic) {
      toast({
        variant: 'destructive',
        title: 'Please enter a topic to study.',
      });
      return;
    }
    startGenerationTransition(async () => {
      setLearningPlan(null);
      setComparisonResults({});
      setVideosToCompare({});
      try {
        const result = await handleGenerateLearningPlan({ topic });
        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'An error occurred',
            description: result.error,
          });
        } else if (result.plan) {
          setLearningPlan(result.plan);
        }
      } catch (e: any) {
        toast({
          variant: 'destructive',
          title: 'An error occurred',
          description: e.message,
        });
      }
    });
  };

  const handleImprovePrompt = () => {
    if (!topic) return;
    startImprovePromptTransition(async () => {
        try {
            const improved = await improvePrompt(topic);
            setTopic(improved);
            toast({ title: 'Prompt Improved!', description: 'Your learning topic has been enhanced by AI.' });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Could not improve prompt', description: e.message });
        }
    });
  };

  const handleImportCourse = (videoId: string) => {
    startImportTransition(async () => {
      if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to add a course.",
        });
        return;
      }

      const result = await getYoutubeChapters(videoId);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error Importing Video',
          description: result.error,
        });
      } else if (result.videoTitle && result.chapters) {
        const newCourseData: Partial<Omit<Course, 'id'>> = {
            title: result.videoTitle,
            videoId: videoId,
            chapters: result.chapters,
            userId: user.uid,
        };

        const newCourseId = await addCourse(firestore, user.uid, newCourseData);

        if (newCourseId) {
            toast({
              title: 'Course Added!',
              description: `"${result.videoTitle}" has been added to your courses.`,
            });
            router.push('/creator');
        } else {
             toast({
                variant: 'destructive',
                title: 'Error Adding Course',
                description: 'Could not create the new course in the database.',
            });
        }
      }
    });
  };

  const toggleVideoForComparison = (stepIndex: number, videoId: string) => {
    setVideosToCompare(prev => {
        const currentStepSelection = prev[stepIndex] || [];
        const isSelected = currentStepSelection.includes(videoId);
        let newSelection;
        if (isSelected) {
            newSelection = currentStepSelection.filter(id => id !== videoId);
        } else {
            if (currentStepSelection.length < 3) {
                newSelection = [...currentStepSelection, videoId];
            } else {
                toast({ variant: 'destructive', title: 'You can only compare up to 3 videos.'})
                return prev;
            }
        }
        return { ...prev, [stepIndex]: newSelection };
    });
  };

  const handleCompare = (stepIndex: number) => {
    const videoIds = videosToCompare[stepIndex];
    if (!videoIds || videoIds.length < 2) {
        toast({ variant: 'destructive', title: 'Select at least 2 videos to compare.' });
        return;
    }

    startComparisonTransition(async () => {
        const step = learningPlan?.roadmap[stepIndex];
        if (!step) return;

        const videos = videoIds.map(id => {
            const video = step.suggestedVideos.find(v => v.videoId === id);
            return { id: video!.videoId, title: video!.title, channelTitle: video!.channelTitle };
        });

        const result = await handleCompareVideos({ topic, videos });
        if (result.error) {
            toast({ variant: 'destructive', title: 'Comparison Failed', description: result.error });
        } else {
            setComparisonResults(prev => ({ ...prev, [stepIndex]: result.comparison! }));
        }
    });
  };


  const SuggestionCard = ({ video, stepIndex }: { video: VideoSuggestion, stepIndex: number }) => (
    <Card className="flex flex-col md:flex-row gap-4 p-4 relative transition-shadow hover:shadow-md">
        <div className="absolute top-2 right-2">
            <Checkbox
                id={`compare-${stepIndex}-${video.videoId}`}
                onCheckedChange={() => toggleVideoForComparison(stepIndex, video.videoId)}
                checked={(videosToCompare[stepIndex] || []).includes(video.videoId)}
            />
            <label htmlFor={`compare-${stepIndex}-${video.videoId}`} className="sr-only">Compare</label>
        </div>
      <div className="md:w-1/3">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          width={160}
          height={90}
          className="rounded-md w-full aspect-video object-cover"
        />
      </div>
      <div className="md:w-2/3 space-y-2">
        <p className="font-semibold">{video.title}</p>
        <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
        <Button
          size="sm"
          onClick={() => handleImportCourse(video.videoId)}
          disabled={isImporting}
        >
          {isImporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Youtube className="mr-2 h-4 w-4" />
          )}
          Add to Courses
        </Button>
      </div>
    </Card>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-auto md:mr-4 flex">
            <Header />
          </div>
          <div className="flex items-center justify-end ml-auto">
            <AuthHeader />
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/creator">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
          <div className="text-center mt-4">
            <h1 className="text-4xl font-bold font-headline">Course Mentor</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Your personal AI guide to finding and structuring your learning path.
            </p>
          </div>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>What do you want to learn today?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                placeholder="e.g., React state management"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              />
              {aiAvailable && (
                <Button variant="ghost" size="icon" onClick={handleImprovePrompt} disabled={isImprovingPrompt || !topic} title="Improve Prompt">
                    {isImprovingPrompt ? <Loader2 className="animate-spin" /> : <Wand2 />}
                </Button>
              )}
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="animate-spin mr-2"/> : <Search className="mr-2 h-4 w-4" />}
                Generate Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {isGenerating && (
          <div className="text-center mt-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">
              Building your personalized learning plan...
            </p>
          </div>
        )}

        {learningPlan && (
          <div className="mt-12 space-y-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                            <GitBranch /> Prerequisites
                        </CardTitle>
                        <CardDescription>Recommended videos for topics you should know first.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Carousel 
                            plugins={[autoplayPlugin.current]}
                            className="w-full"
                            onMouseEnter={() => autoplayPlugin.current.stop()}
                            onMouseLeave={() => autoplayPlugin.current.reset()}
                        >
                            <CarouselContent>
                                {learningPlan.prerequisites.flatMap(p => p.suggestedVideos).map((video, index) => (
                                    <CarouselItem key={index}>
                                        <div className="p-1">
                                            <Card>
                                                <CardContent className="flex flex-col items-center justify-center p-4 gap-4">
                                                     <Image
                                                        src={video.thumbnailUrl}
                                                        alt={video.title}
                                                        width={200}
                                                        height={112}
                                                        className="rounded-md w-full aspect-video object-cover"
                                                        />
                                                    <div className='w-full'>
                                                        <p className="font-semibold text-sm line-clamp-2">{video.title}</p>
                                                        <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className='w-full'
                                                        onClick={() => handleImportCourse(video.videoId)}
                                                        disabled={isImporting}
                                                    >
                                                        {isImporting ? <Loader2 className="animate-spin" /> : <Youtube className="mr-2" />}
                                                        Add Course
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </CardContent>
                </Card>

              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                          <BookCopy /> Key Concepts
                      </CardTitle>
                      <CardDescription>Core ideas and technologies you will encounter.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ul className="list-disc pl-5 space-y-2">
                          {learningPlan.keyConcepts.map((kc, i) => (
                              <li key={i}>
                                  <span className="font-semibold">{kc.concept}:</span> {kc.description}
                              </li>
                          ))}
                      </ul>
                  </CardContent>
              </Card>
            </div>
            
            <div>
                <h2 className="text-3xl font-bold font-headline mb-8 text-center">Your Learning Roadmap</h2>
                <div className="space-y-8">
                {learningPlan.roadmap.map((step, index) => (
                    <div key={index} className="flex gap-6">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full text-primary-foreground font-bold text-xl">
                        {step.step}
                        </div>
                        {index < learningPlan.roadmap.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border my-2"></div>
                        )}
                    </div>
                    <div className="flex-1 pb-8">
                        <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">{step.title}</CardTitle>
                            <CardDescription>{step.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <h4 className="font-semibold">Suggested Videos for this step:</h4>
                            
                            <Carousel className="w-full">
                                <CarouselContent className="-ml-2">
                                    {step.suggestedVideos.map((video) => (
                                        <CarouselItem key={video.videoId} className="pl-2 md:basis-1/2 lg:basis-1/3">
                                             <div className="p-1">
                                                <Card className='relative'>
                                                    <div className="absolute top-2 right-2 bg-background/50 rounded-full">
                                                        <Checkbox
                                                            id={`compare-${index}-${video.videoId}`}
                                                            onCheckedChange={() => toggleVideoForComparison(index, video.videoId)}
                                                            checked={(videosToCompare[index] || []).includes(video.videoId)}
                                                        />
                                                    </div>
                                                    <CardContent className="flex flex-col items-center justify-center p-4 gap-4">
                                                        <Image
                                                            src={video.thumbnailUrl}
                                                            alt={video.title}
                                                            width={200}
                                                            height={112}
                                                            className="rounded-md w-full aspect-video object-cover"
                                                            />
                                                        <div className='w-full h-16'>
                                                            <p className="font-semibold text-sm line-clamp-2">{video.title}</p>
                                                            <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className='w-full'
                                                            onClick={() => handleImportCourse(video.videoId)}
                                                            disabled={isImporting}
                                                        >
                                                            {isImporting ? <Loader2 className="animate-spin" /> : <Youtube className="mr-2" />}
                                                            Add
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className='-left-4' />
                                <CarouselNext className='-right-4'/>
                            </Carousel>
                            
                            <div className="mt-6">
                                <Button 
                                    onClick={() => handleCompare(index)} 
                                    disabled={isComparing || (videosToCompare[index]?.length || 0) < 2}
                                >
                                    {isComparing ? <Loader2 className="mr-2 animate-spin" /> : <ChevronsRight className="mr-2" />}
                                    Compare Selected Videos
                                </Button>
                            </div>
                            {isComparing && comparisonResults[index] === undefined && (
                                    <div className="text-center mt-6">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                                    <p className="mt-2 text-muted-foreground">Comparing videos...</p>
                                </div>
                            )}
                            {comparisonResults[index] && (
                                <Alert className="mt-6">
                                    <Sparkles className="h-4 w-4" />
                                    <AlertTitle className="font-headline">AI Comparison</AlertTitle>
                                    <AlertDescription>
                                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: comparisonResults[index] }}></div>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                        </Card>
                    </div>
                    </div>
                ))}
                </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
