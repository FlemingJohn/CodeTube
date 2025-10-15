

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Youtube,
  Sparkles,
  Code,
  FileEdit,
  UploadCloud,
  BrainCircuit,
  Star,
  ArrowUp,
} from 'lucide-react';
import Header from '@/components/codetube/Header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import AuthHeader from '@/components/auth/AuthHeader';
import { SiFirebase, SiNextdotjs } from '@icons-pack/react-simple-icons';
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

const features = [
  {
    icon: <Youtube className="h-10 w-10 text-primary" />,
    title: 'Import from YouTube',
    description:
      'Paste any YouTube link and automatically detect chapters and generate transcripts.',
  },
  {
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Notes',
    description:
      'Generate concise, AI-powered summaries for each chapter to enhance learning.',
  },
  {
    icon: <Code className="h-10 w-10 text-primary" />,
    title: 'Interactive Code Snippets',
    description:
      'Embed editable code snippets for hands-on practice directly within your course.',
  },
];

const howItWorks = [
  {
    icon: <Youtube className="h-8 w-8 text-primary" />,
    title: '1. Import Video',
    description:
      'Paste a YouTube video link to automatically pull in the title and chapters.',
  },
  {
    icon: <FileEdit className="h-8 w-8 text-primary" />,
    title: '2. Add Content',
    description:
      'Enrich each chapter with AI-generated notes and relevant code snippets.',
  },
  {
    icon: <UploadCloud className="h-8 w-8 text-primary" />,
    title: '3. Export & Share',
    description:
      'Export the entire course to a new GitHub repository with a single click.',
  },
];

const mainTech = [
  {
    icon: <SiNextdotjs className="h-10 w-10" />,
    title: 'Next.js & React',
    description:
      'The application is built with the latest Next.js App Router for a fast, modern, and server-driven user experience.',
  },
  {
    icon: <SiFirebase className="h-10 w-10 text-orange-500" />,
    title: 'Firebase',
    description:
      'Firebase provides secure user authentication and a scalable Firestore database for storing course data.',
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-blue-500" />,
    title: "Powered by Google AI",
    description:
      "Google's Gemini models power the AI features, such as chapter summaries, through the Genkit framework.",
  },
];

const testimonials = [
  {
    quote:
      'The AI code explanation is a lifesaver. It breaks down complex snippets into easy-to-understand steps, which has been amazing for my learning.',
    name: 'Chris Patel',
    title: 'Self-Taught Programmer',
  },
  {
    quote:
      'As a student, being able to see the code, notes, and video side-by-side is incredibly helpful. I wish all my tutorials used a tool like this!',
    name: 'Samantha Lee',
    title: 'Computer Science Student',
  },
  {
    quote:
      'I use this to review tutorials before job interviews. The AI summaries and GitHub export help me create a quick portfolio piece. It\'s brilliant.',
    name: 'Michael B.',
    title: 'Junior Backend Developer',
  },
  {
    quote:
      'CodeTube transformed the way I follow along with coding tutorials. The automatic chapter detection is a game-changer!',
    name: 'Alex Johnson',
    title: 'Frontend Developer',
  },
  {
    quote:
      'The ability to export my notes and code to GitHub is an incredible feature for building my portfolio.',
    name: 'Jessica Rodriguez',
    title: 'Aspiring Full-Stack Developer',
  },
];

const faqs = [
  {
    question: 'Is CodeTube free to use?',
    answer:
      'Yes, CodeTube is free to use during our beta period. You can import videos, create courses, and export to GitHub without any cost. We may introduce premium features in the future.',
  },
  {
    question: 'How does the AI summary work?',
    answer:
      "Our AI, powered by Google's Gemini models, processes the transcript of your video chapter to generate a concise and accurate summary. It's designed to capture the key points and save you time.",
  },
  {
    question: 'Can I use any YouTube video?',
    answer:
      'Yes, you can import any public YouTube video. For the best results with automatic chapter detection, ensure the video has timestamps listed in its description.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. We use Firebase for authentication and database management, which provides industry-standard security for all user data. Your courses are private to your account until you choose to export them.',
  },
];

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'landing-hero');
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
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
                Turn Any YouTube Video into an Interactive Course in Minutes
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-3xl">
                Effortlessly create engaging learning experiences with AI-powered
                summaries, code snippets, and more. Transform passive viewing
                into active learning.
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
            {heroImage && (
              <AnimateOnScroll className="w-full max-w-4xl" delay={200}>
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl mx-auto"
                  data-ai-hint={heroImage.imageHint}
                />
              </AnimateOnScroll>
            )}
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
                Why CodeTube?
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                We provide powerful, AI-driven tools to make course creation
                simple and effective.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
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
                How It Works
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

        {/* Featured Course Section */}
        <section id="featured-course" className="w-full bg-secondary/50 py-20 md:py-28">
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


        {/* Testimonials Section */}
        <section className="w-full py-20 md:py-28">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Loved by Developers and Students
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                See what people are saying about their experience with CodeTube.
              </p>
            </div>
            <Carousel
              plugins={[autoplayPlugin.current]}
              onMouseEnter={autoplayPlugin.current.stop}
              onMouseLeave={autoplayPlugin.current.reset}
              className="w-full max-w-4xl mx-auto"
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Card className="h-full flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                        <CardContent className="pt-6">
                          <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-5 w-5 text-yellow-400 fill-yellow-400"
                              />
                            ))}
                          </div>
                          <p className="text-foreground italic mb-4">
                            "{testimonial.quote}"
                          </p>
                        </CardContent>
                        <CardHeader className="pt-0">
                          <div className="font-semibold">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {testimonial.title}
                          </div>
                        </CardHeader>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="w-full bg-secondary/50 py-20 md:py-28">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font headline">
                Built With a Modern Tech Stack
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                Leveraging the best tools for a fast, scalable, and
                intelligent application.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {mainTech.map((tech, index) => (
                <AnimateOnScroll key={tech.title} delay={index * 100}>
                  <Card className="text-center h-full transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                    <CardHeader>
                      <div className="mx-auto p-4 rounded-full w-fit">
                        {tech.icon}
                      </div>
                      <CardTitle className="font-headline text-xl pt-4">
                        {tech.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {tech.description}
                      </p>
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              ))}
            </div>
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
                  <AccordionTrigger className="font-headline text-lg">
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
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mt-4 mb-8">
              Begin creating your first interactive course in just a few clicks.
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
              <h4 className="font-semibold mb-2">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
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
