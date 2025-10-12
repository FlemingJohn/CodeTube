import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, Sparkles, Code, FileEdit, UploadCloud, BrainCircuit } from 'lucide-react';
import Header from '@/components/codetube/Header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import AuthHeader from '@/components/auth/AuthHeader';
import { SiFirebase, SiNextdotjs } from '@icons-pack/react-simple-icons';

const features = [
  {
    icon: <Youtube className="h-10 w-10 text-primary" />,
    title: 'Import from YouTube',
    description: 'Paste any YouTube link and automatically detect chapters and generate transcripts.',
  },
  {
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Notes',
    description: 'Generate concise, AI-powered summaries for each chapter to enhance learning.',
  },
  {
    icon: <Code className="h-10 w-10 text-primary" />,
    title: 'Interactive Code Snippets',
    description: 'Embed editable code snippets for hands-on practice directly within your course.',
  },
];

const howItWorks = [
  {
    icon: <Youtube className="h-8 w-8 text-primary" />,
    title: '1. Import Video',
    description: 'Paste a YouTube video link to automatically pull in the title and chapters.',
  },
  {
    icon: <FileEdit className="h-8 w-8 text-primary" />,
    title: '2. Add Content',
    description: 'Enrich each chapter with AI-generated notes and relevant code snippets.',
  },
  {
    icon: <UploadCloud className="h-8 w-8 text-primary" />,
    title: '3. Export & Share',
    description: 'Export the entire course to a new GitHub repository with a single click.',
  },
]

const mainTech = [
    {
      icon: <SiNextdotjs className="h-10 w-10" />,
      title: 'Next.js & React',
      description: 'The application is built with the latest Next.js App Router for a fast, modern, and server-driven user experience.',
    },
    {
      icon: <SiFirebase className="h-10 w-10 text-primary" />,
      title: 'Firebase',
      description: 'Firebase provides secure user authentication and a scalable Firestore database for storing course data.',
    },
    {
      icon: <BrainCircuit className="h-10 w-10 text-primary" />,
      title: 'Genkit & Google AI',
      description: 'Google\'s Gemini models power the AI features, such as chapter summaries, through the Genkit framework.',
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
                Turn YouTube Videos into Interactive Courses
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-3xl">
                Effortlessly create engaging learning experiences with AI-powered summaries, code snippets, and more. Transform passive viewing into active learning.
              </p>
              <Button size="lg" asChild>
                <Link href="/creator">Start Creating for Free</Link>
              </Button>
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
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Why CodeTube?</h2>
              <p className="text-lg text-muted-foreground mt-4">
                We provide powerful, AI-driven tools to make course creation simple and effective.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-xl pt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
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
              <h2 className="text-3xl md:text-4xl font-bold font-headline">How It Works</h2>
              <p className="text-lg text-muted-foreground mt-4">
                Create an interactive course from any YouTube video in just three simple steps.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {howItWorks.map((step) => (
                  <Card key={step.title} className="text-center">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      {step.icon}
                    </div>
                    <CardTitle className="font-headline text-xl pt-4">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                ))}
              </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="w-full bg-secondary/50 py-20 md:py-28">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Built With a Modern Tech Stack</h2>
              <p className="text-lg text-muted-foreground mt-4">
                Leveraging the best tools for a fast, scalable, and intelligent application.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {mainTech.map((tech) => (
                <Card key={tech.title} className="text-center">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      {tech.icon}
                    </div>
                    <CardTitle className="font-headline text-xl pt-4">{tech.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{tech.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-28">
          <div className="container text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mt-4 mb-8">
              Begin creating your first interactive course in just a few clicks.
            </p>
            <Button size="lg" asChild>
              <Link href="/creator">Launch Creator Studio</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="w-full border-t">
        <div className="container flex flex-col sm:flex-row items-center justify-between py-6 gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CodeTube. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
