import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: {
    default: 'CodeTube | Turn YouTube Videos into Interactive Courses',
    template: `%s | CodeTube`,
  },
  description: 'Turn any YouTube video into an interactive course in minutes. Effortlessly create engaging learning experiences with AI-powered summaries and code snippets.',
  keywords: ['YouTube to course', 'interactive tutorial', 'coding education', 'AI course creation', 'learn to code'],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
