
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { FocusModeProvider } from '@/hooks/use-focus-mode';

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
          'name': 'Is CodeTube free to use?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes, CodeTube is free to use during our beta period. You can import videos, create courses, and export to GitHub without any cost. We may introduce premium features in the future.',
          },
        },
        {
          '@type': 'Question',
          'name': 'How does the AI summary work?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "Our AI, powered by Google's Gemini models, processes the transcript of your video chapter to generate a concise and accurate summary. It's designed to capture the key points and save you time.",
          },
        },
        {
          '@type': 'Question',
          'name': 'Can I use any YouTube video?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes, you can import any public YouTube video. For the best results with automatic chapter detection, ensure the video has timestamps listed in its description.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Is my data secure?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Absolutely. We use Firebase for authentication and database management, which provides industry-standard security for all user data. Your courses are private to your account until you choose to export them.',
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
        <link rel="icon" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='red' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z'/%3e%3cpath d='m6.2 5.3 3.1 3.9'/%3e%3cpath d='m12.4 3.6 3.1 3.9'/%3e%3cpath d='M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'/%3e%3c/svg%3e" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <FocusModeProvider>
            {children}
          </FocusModeProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
