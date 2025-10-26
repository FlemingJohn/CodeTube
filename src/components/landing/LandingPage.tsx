

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Youtube,
  Sparkles,
  Code,
  FileEdit,
  BrainCircuit,
  Star,
  ArrowUp,
  HelpCircle,
  Briefcase,
  Mic,
  GraduationCap,
  Rocket,
  TrendingUp,
  Check,
  Github,
  Terminal,
  BookUser,
  Eye,
  Chrome,
} from 'lucide-react';
import Header from '@/components/codetube/Header';
import AuthHeader from '@/components/auth/AuthHeader';
import { SiFirebase, SiNextdotjs, SiGoogle, SiGithub } from '@icons-pack/react-simple-icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import BeforeAfterSlider from './BeforeAfterSlider';
import AnimateOnScroll from './AnimateOnScroll';
import FeaturedCourse from './FeaturedCourse';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const features = [
  {
    icon: <Youtube className="h-10 w-10 text-primary" />,
    title: 'Instant Video Import',
    description:
      'Paste any YouTube link to automatically generate transcripts and detect chapters in seconds.',
  },
  {
    icon: <BookUser className="h-10 w-10 text-primary" />,
    title: 'AI Learning Roadmap',
    description:
      'Generate a step-by-step learning plan for any topic, complete with prerequisites, key concepts, and suggested videos.',
  },
  {
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Notes',
    description:
      'Generate concise, AI-powered summaries and notes for each chapter to enhance learning.',
  },
  {
    icon: <HelpCircle className="h-10 w-10 text-primary" />,
    title: 'AI-Generated Quizzes',
    description:
      'Automatically generate multi-question quizzes for each chapter to test understanding and reinforce concepts.',
  },
  {
    icon: <Eye className="h-10 w-10 text-primary" />,
    title: 'Focus Mode',
    description:
      'Customize your workspace by toggling UI elements like the code editor, quiz, and notes to eliminate distractions.',
  },
  {
    icon: <Mic className="h-10 w-10 text-primary" />,
    title: 'Practice Your Pitch',
    description:
      'Record yourself answering interview questions and get instant, AI-powered feedback on your delivery.',
  },
];

const howItWorks = [
  {
    icon: <BookUser className="h-8 w-8 text-primary" />,
    title: '1. Plan Your Learning',
    description:
      'Use the AI Course Mentor to generate a step-by-step roadmap for any topic you want to learn.',
  },
  {
    icon: <Youtube className="h-8 w-8 text-primary" />,
    title: '2. Import & Enrich',
    description:
      'Import a suggested YouTube video. Then, use AI to generate notes, find code, and create quizzes.',
  },
  {
    icon: <Mic className="h-8 w-8 text-primary" />,
    title: '3. Practice & Prepare',
    description:
      'Use the AI-generated interview scenarios to practice your pitch and get instant feedback.',
  },
];

const targetAudience = [
    {
      icon: <GraduationCap className="h-10 w-10 text-primary" />,
      title: 'For Students',
      benefits: [
        'Turn dense lectures into interactive study guides.',
        'Use AI-quizzes to ace your exams.',
        'Build a verifiable project for your portfolio.',
      ],
    },
    {
      icon: <Rocket className="h-10 w-10 text-primary" />,
      title: 'For Junior Developers',
      benefits: [
        'Bridge the gap between tutorials and job-readiness.',
        'Practice interview pitches with AI feedback.',
        'Export completed courses to GitHub to showcase skills.',
      ],
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-primary" />,
      title: 'For Working Professionals',
      benefits: [
        'Quickly upskill on new technologies without friction.',
        'Instantly summarize long videos to extract key concepts.',
        'Stay ahead of the curve in your career.',
      ],
    },
  ];

const apiUsage = [
    {
        icon: <SiFirebase size={24} className="text-yellow-500" />,
        name: "Firebase Studio",
        description: "The AI-powered IDE used to build and iterate on this application."
    },
    {
        icon: <Chrome size={24} className="text-green-500" />,
        name: "Chrome Built-in AI",
        description: "Provides instant, on-device AI for summaries and writing tools in supported browsers."
    },
    {
        icon: <SiGoogle size={24} className="text-red-500" />,
        name: "Google (YouTube)",
        description: "Fetches video titles, descriptions, and transcripts for course creation."
    },
    {
        icon: <BrainCircuit size={24} className="text-blue-500" />,
        name: "Google (Gemini)",
        description: "Powers all generative AI features: summaries, quizzes, interview prep, and the AI Study Hub."
    },
    {
        icon: <SiGithub size={24} />,
        name: "GitHub",
        description: "Creates new repositories and pushes course content as Markdown files."
    },
    {
        icon: <Terminal size={24} className="text-green-500" />,
        name: "Judge0",
        description: "Enables interactive code execution within chapters for multiple programming languages."
    }
];

const faqs = [
  {
    question: "Who is CodeTube for?",
    answer: "CodeTube is designed for self-directed learners, including students, junior developers, and working professionals. If you use YouTube to learn new technical skills, CodeTube helps you do it more effectively and turn that learning into career opportunities."
  },
  {
    question: "How does the 'Practice Your Pitch' feature work?",
    answer: "This feature uses multiple AI models. First, it analyzes your course content to create a relevant interview scenario. Then, you record your answer with your microphone. The audio is transcribed to text, and then another AI analyzes your answer to provide feedback on your clarity, confidence, and technical explanation."
  },
  {
    question: 'How do the AI quizzes and interview questions work?',
    answer:
      "Our AI, powered by Google's Gemini models, processes the transcript of your video chapter to generate relevant multiple-choice questions or technical interview questions. It's designed to test key concepts from the material to help you prepare.",
  },
  {
    question: 'Can I use any YouTube video?',
    answer:
      'Yes, you can import any public YouTube video. For the best results with automatic chapter detection and transcripts, choose videos where the creator has enabled captions and listed timestamps in the description.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. We use Firebase for authentication and database management, which provides industry-standard security for all user data. Your courses are private to your account until you choose to export them.',
  },
];

export default function LandingPage() {
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-auto md:mr-4 flex">
            <Header />
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="#features" className="transition-all hover:text-foreground/80 text-foreground/60 hover:scale-105">Features</Link>
            <Link href="#how-it-works" className="transition-all hover:text-foreground/80 text-foreground/60 hover:scale-105">How It Works</Link>
            <Link href="#faq" className="transition-all hover:text-foreground/80 text-foreground/60 hover:scale-105">FAQ</Link>
          </nav>
          <div className="flex items-center justify-end ml-auto">
            <AuthHeader />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="hero" className="w-full py-20 md:py-32">
          <div className="container grid gap-12 items-center justify-items-center">
            <div className="flex flex-col items-center text-center space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline tracking-tighter">
                From Passive Watching to Productive Learning
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-3xl">
                CodeTube transforms distracting YouTube tutorials into focused, interactive courses. Spend less time scrubbing through videos and more time building real, career-ready skills.
              </p>
              <div className="flex flex-col items-center gap-2">
                <Button size="lg" asChild className="transition-transform hover:scale-105">
                  <Link href="/creator">Start Your Free Course</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  No credit card required, get started for free.
                </p>
              </div>
            </div>
            <AnimateOnScroll className="w-full max-w-4xl" delay={200}>
              <svg
                viewBox="0 0 600 400"
                className="rounded-lg shadow-2xl mx-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="grad1"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }}
                    />
                  </linearGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <rect width="600" height="400" rx="8" fill="hsl(var(--card))" />

                {/* Left Side: Video Player */}
                <rect x="30" y="50" width="250" height="150" rx="8" fill="hsl(var(--muted))" />
                <circle cx="155" cy="125" r="30" fill="hsl(var(--background))" />
                <path d="M 145 110 L 175 125 L 145 140 Z" fill="hsl(var(--primary))" />
                <rect x="30" y="220" width="250" height="12" rx="6" fill="hsl(var(--muted))" />
                <rect x="30" y="220" width="100" height="12" rx="6" fill="hsl(var(--primary))" />

                {/* Arrow */}
                <path
                  d="M 300 190 L 340 190 L 340 180 L 360 200 L 340 220 L 340 210 L 300 210 Z"
                  fill="url(#grad1)"
                  filter="url(#glow)"
                />

                {/* Right Side: Course UI */}
                <rect x="380" y="50" width="200" height="300" rx="8" fill="hsl(var(--muted))" />
                <rect x="390" y="60" width="180" height="20" rx="4" fill="hsl(var(--background))" />
                <rect x="390" y="90" width="180" height="40" rx="4" fill="hsl(var(--primary))" fillOpacity="0.1" />
                 <rect x="400" y="98" width="80" height="8" rx="2" fill="hsl(var(--primary))" />
                 <rect x="400" y="112" width="40" height="6" rx="2" fill="hsl(var(--primary))" fillOpacity="0.5" />
                <rect x="390" y="140" width="180" height="60" rx="4" fill="hsl(var(--background))" />
                 <rect x="400" y="150" width="160" height="8" rx="2" fill="hsl(var(--muted-foreground))" fillOpacity="0.3" />
                 <rect x="400" y="162" width="140" height="8" rx="2" fill="hsl(var(--muted-foreground))" fillOpacity="0.3" />
                 <rect x="400" y="174" width="160" height="8" rx="2" fill="hsl(var(--muted-foreground))" fillOpacity="0.3" />
                <rect x="390" y="210" width="180" height="80" rx="4" fill="hsl(var(--background))" />
                 <rect x="400" y="220" width="40" height="8" rx="2" fill="hsl(var(--primary))" fillOpacity="0.6" />
                 <rect x="400" y="235" width="150" height="6" rx="2" fill="hsl(var(--muted-foreground))" fillOpacity="0.3" />
                 <rect x="400" y="245" width="120" height="6" rx="2" fill="hsl(var(--muted-foreground))_foreground)" fillOpacity="0.3" />
              </svg>
            </AnimateOnScroll>
          </div>
        </section>
        
        {/* Before/After Slider Section */}
        <section id="demo" className="w-full py-20 md:py-28">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                See the Transformation
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                Drag the slider to see how a standard YouTube video becomes an interactive CodeTube course.
              </p>
            </div>
            <BeforeAfterSlider />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full bg-secondary/50 py-20 md:py-28">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                A Smarter Way to Learn
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                We provide powerful, AI-driven tools to make course creation and learning simple and effective.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <AnimateOnScroll key={feature.title} delay={index * 100}>
                  <Card className="text-center h-full transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                    <CardHeader>
                      <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                        {feature.icon}
                      </div>
                      <CardTitle className="font-headline text-xl pt-4">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-20 md:py-28">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                From Video to Portfolio in 3 Steps
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                Create an interactive course from any YouTube video in just
                three simple steps.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((step, index) => (
                <AnimateOnScroll key={step.title} delay={index * 100}>
                  <Card className="text-center h-full transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                    <CardHeader>
                      <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                        {step.icon}
                      </div>
                      <CardTitle className="font-headline text-xl pt-4">
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Target Audience Section */}
        <section id="target-audience" className="w-full bg-secondary/50 py-20 md:py-28">
            <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">
                        Built for Every Stage of Your Career
                    </h2>
                    <p className="text-lg text-muted-foreground mt-4">
                        Whether you're just starting out or a seasoned pro, CodeTube helps you learn faster and smarter.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {targetAudience.map((target, index) => (
                        <AnimateOnScroll key={target.title} delay={index * 100}>
                            <Card className="h-full flex flex-col text-center transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                                <CardHeader>
                                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                                        {target.icon}
                                    </div>
                                    <CardTitle className="font-headline text-xl pt-4">
                                        {target.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <ul className="space-y-2 text-left">
                                        {target.benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                                                <span className="text-muted-foreground">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </AnimateOnScroll>
                    ))}
                </div>
            </div>
        </section>

        {/* Featured Course Section */}
        <section id="featured-course" className="w-full py-20 md:py-28">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                A Glimpse of the Final Product
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                Here’s what your interactive course could look like.
              </p>
            </div>
            <FeaturedCourse />
          </div>
        </section>


        {/* API Usage Section */}
        <section className="w-full bg-secondary/50 py-20 md:py-28">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font headline">
                Powered by a Modern API Stack
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                Leveraging the best services for a fast, scalable, and
                intelligent application.
              </p>
            </div>
            <AnimateOnScroll className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {apiUsage.map((api) => (
                        <Card key={api.name} className="flex flex-col">
                            <CardHeader className="flex flex-row items-center gap-4">
                                {api.icon}
                                <CardTitle className="font-headline text-xl">{api.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-muted-foreground">{api.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </AnimateOnScroll>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="w-full py-20 md:py-28">
          <div className="container max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Frequently Asked Questions
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map(faq => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="font-headline text-lg text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-secondary/50 py-20 md:py-28">
          <div className="container text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">
              Ready to Stop Watching and Start Building?
            </h2>
            <p className="text-lg text-muted-foreground mt-4 mb-8">
              Begin creating your first interactive course in just a few clicks. Turn your learning into a career asset.
            </p>
            <Button size="lg" asChild className="transition-transform hover:scale-105">
              <Link href="/creator">Launch Your Creator Studio</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="w-full border-t">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-2">
              <Header />
              <p className="text-sm text-muted-foreground">
                Turn YouTube videos into interactive courses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Navigate</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</Link></li>
                <li><Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQs</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Get Started</h4>
              <Button asChild className="transition-transform hover:scale-105">
                <Link href="/creator">Launch Creator Studio</Link>
              </Button>
            </div>
          </div>
          <div className="mt-8 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} CodeTube. All rights reserved.</p>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#hero" className="flex items-center gap-2">
                Back to top <ArrowUp className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
