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
    icon: <SiFirebase className="h-10 w-10 text-primary" />,
    title: 'Firebase',
    description:
      'Firebase provides secure user authentication and a scalable Firestore database for storing course data.',
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary" />,
    title: "Genkit & Google AI",
    description:
      "Google's Gemini models power the AI features, such as chapter summaries, through the Genkit framework.",
  },
];

const testimonials = [
  {
    quote:
      'CodeTube transformed my static videos into a dynamic learning experience. The AI summary feature is a game-changer!',
    name: 'Alex Johnson',
    title: 'Frontend Developer & Educator',
  },
  {
    quote:
      'As a visual learner, being able to see the code and notes side-by-side with the video is incredibly helpful. I wish I had this sooner!',
    name: 'Maria Garcia',
    title: 'Software Engineering Student',
  },
  {
    quote:
      'The GitHub export feature is pure magic. It saved me hours of manual work and created a professional-looking repository for my students.',
    name: 'David Chen',
    title: 'DevOps Instructor',
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Header />
          <AuthHeader />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32">
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
                <Button size="lg" asChild>
                  <Link href="/creator">Start Your Free Course</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  No credit card required, get started for free.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={heroImage.imageHint}
                  className="rounded-lg shadow-2xl"
                />
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full bg-secondary/50 py-20 md:py-28">
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
              {features.map(feature => (
                <Card key={feature.title} className="text-center">
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
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-20 md:py-28">
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
              {howItWorks.map(step => (
                <Card key={step.title} className="text-center">
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
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full bg-secondary/50 py-20 md:py-28">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Loved by Creators and Students
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                See what people are saying about their experience with CodeTube.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map(testimonial => (
                <Card key={testimonial.name}>
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
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.title}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="w-full py-20 md:py-28">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Built With a Modern Tech Stack
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                Leveraging the best tools for a fast, scalable, and
                intelligent application.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {mainTech.map(tech => (
                <Card key={tech.title} className="text-center">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
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
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="w-full bg-secondary/50 py-20 md:py-28">
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
        <section className="w-full py-20 md:py-28">
          <div className="container text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mt-4 mb-8">
              Begin creating your first interactive course in just a few clicks.
            </p>
            <Button size="lg" asChild>
              <Link href="/creator">Launch Your Creator Studio</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="w-full border-t">
        <div className="container flex flex-col sm:flex-row items-center justify-between py-6 gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CodeTube. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
