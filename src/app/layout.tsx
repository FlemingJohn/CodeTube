
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { FocusModeProvider } from '@/hooks/use-focus-mode.tsx';
import NetworkStatusIndicator from '@/components/codetube/NetworkStatusIndicator';

export const metadata: Metadata = {
  title: {
    default: 'CodeTube | Turn YouTube Videos into Interactive Courses',
    template: `%s | CodeTube`,
  },
  description: 'Turn any YouTube video into an interactive course in minutes. Effortlessly create engaging learning experiences with AI-powered summaries and code snippets.',
  keywords: ['YouTube to course', 'interactive tutorial', 'coding education', 'AI course creation', 'learn to code'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'CodeTube | Turn YouTube Videos into Interactive Courses',
    description: 'Transform passive YouTube tutorials into active learning experiences with AI-powered notes, code snippets, and GitHub integration.',
    url: 'https://codetube.dev', // Replace with your actual domain
    siteName: 'CodeTube',
    images: [
      {
        url: 'https://codetube.dev/og-image.png', // Replace with your actual OG image URL
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeTube | Turn YouTube Videos into Interactive Courses',
    description: 'Transform passive YouTube tutorials into active learning experiences with AI-powered notes, code snippets, and GitHub integration.',
    // creator: '@yourtwitterhandle', // Replace with your Twitter handle
    images: ['https://codetube.dev/twitter-image.png'], // Replace with your actual Twitter image URL
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      'name': 'CodeTube',
      'url': 'https://codetube.dev', // Replace with your actual domain
    },
    {
      '@type': 'SoftwareApplication',
      'name': 'CodeTube',
      'operatingSystem': 'WEB',
      'applicationCategory': 'DeveloperApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
      },
      'description': 'An application that transforms YouTube coding tutorials into interactive, hands-on learning courses with AI-powered summaries and code snippets.',
    },
    {
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is CodeTube?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'CodeTube is a web application that transforms passive YouTube coding tutorials into structured, interactive learning experiences. It uses AI to generate notes, quizzes, and code snippets, helping you learn more effectively and build a portfolio-ready project from any video.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Who is CodeTube for?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'CodeTube is for anyone who uses YouTube to learn technical skills. This includes students, junior developers trying to bridge the gap between tutorials and job-readiness, and working professionals who need to upskill quickly on new technologies.',
          },
        },
        {
          '@type': 'Question',
          'name': 'How does the AI Course Mentor work?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'The Course Mentor is your personal AI learning guide. You give it a topic you want to learn, and it generates a comprehensive learning plan. This includes necessary prerequisites, key concepts to know, and a step-by-step roadmap with suggested YouTube videos for each stage.',
          },
        },
        {
          '@type': 'Question',
          'name': 'What happens when I import a YouTube video?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "When you import a video, CodeTube fetches its title, description, and transcript. It then analyzes the description to automatically detect time-stamped chapters. For each chapter, you can then use AI to generate summaries, find relevant code snippets, create quizzes, and generate interview questions.",
          },
        },
        {
            '@type': 'Question',
            'name': 'What is the "Practice Your Pitch" feature?',
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': "This feature helps you prepare for job interviews. The AI analyzes your course content and generates a realistic behavioral interview question related to your project. You can then record your answer using your microphone. The app transcribes your speech and provides AI-powered feedback on your clarity, confidence, and the structure of your response.",
            },
        },
        {
            '@type': 'Question',
            'name': 'What is "Hybrid AI" and why does CodeTube use it?',
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': "Hybrid AI means we use both client-side (in your browser) and server-side AI. For tasks like proofreading or quick translations, we use Chrome's built-in AI for instant, offline-capable results. For more complex tasks like generating a learning plan or analyzing audio, we use powerful server-side models like Google's Gemini. This gives you the best of both worlds: speed and privacy for simple tasks, and power for complex ones.",
            },
        },
        {
            '@type': 'Question',
            'name': 'Is my data secure?',
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. We use Firebase Authentication and Firestore for secure user management and data storage. Your courses and personal information are private to your account. The "Export to GitHub" feature only runs when you explicitly use it, creating a public repository on your own GitHub account.',
            },
        },
      ],
    },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='red' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-clapperboard'%3E%3Cpath d='m2.6 15.6 3.4-3.4'/_next/static/chunks/src_components_c40e3c47._.js%3E%3Cpath d='M15.4 2.6 12 6'/_next/static/chunks/src_components_c40e3c47._.js%3E%3Cpath d='M2.6 2.6 8 8'/_next/static/chunks/src_components_c40e3c47._.js%3E%3Cpath d='m8 2 8 8'/_next/static/chunks/src_components_c40e3c47._.js%3E%3Cpath d='M16 16 22 22'/_next/static/chunks/src_components_c40e3c47._.js%3E%3Cpath d='M17 3 3 17'/_next/static/chunks/src_components_c40e3c47._.js%3E%3Cpath d='M21.1 15.6 18 12.5'/_next/static/chunks/src_components_c40e3c47._.js%3E%3Cpath d='m6.5 12-3.4 3.4'/_next/static/chunks/src_components_c40e3c47._.js%3E%3Cpath d='M21.1 2.6 18 5.7'/_next/static/chunks/src_components_c40e3c47._.js%3E%3C/svg%3E" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <FocusModeProvider>
            <NetworkStatusIndicator />
            {children}
          </FocusModeProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
