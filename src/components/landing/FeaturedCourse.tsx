'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Code } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';

export default function FeaturedCourse() {
  return (
    <AnimateOnScroll>
      <Card className="w-full max-w-4xl mx-auto shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full aspect-video flex bg-background">
            <div className="w-1/3 border-r border-border p-4 space-y-4 overflow-y-auto">
              <h3 className="text-sm font-semibold text-muted-foreground">CHAPTERS</h3>
              <div className="space-y-2">
                <div className="bg-primary/10 text-primary p-2 rounded-md">
                  <p className="text-sm font-medium">1. Introduction</p>
                  <p className="text-xs text-primary/80">00:00</p>
                </div>
                <div className="hover:bg-accent p-2 rounded-md">
                  <p className="text-sm font-medium">2. Setup Project</p>
                  <p className="text-xs text-muted-foreground">02:15</p>
                </div>
                <div className="hover:bg-accent p-2 rounded-md">
                  <p className="text-sm font-medium">3. Building the UI</p>
                  <p className="text-xs text-muted-foreground">05:45</p>
                </div>
                <div className="hover:bg-accent p-2 rounded-md">
                    <p className="text-sm font-medium">4. State Management</p>
                    <p className="text-xs text-muted-foreground">11:30</p>
                </div>
                <div className="hover:bg-accent p-2 rounded-md">
                    <p className="text-sm font-medium">5. AI Integration</p>
                    <p className="text-xs text-muted-foreground">15:20</p>
                </div>
                 <div className="hover:bg-accent p-2 rounded-md">
                    <p className="text-sm font-medium">6. Deployment</p>
                    <p className="text-xs text-muted-foreground">21:05</p>
                </div>
              </div>
            </div>
            <div className="w-2/3 p-6 space-y-6 bg-muted/20">
              <h2 className="text-2xl font-bold font-headline">Chapter Details: AI Integration</h2>
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> AI-Generated Summary
                </p>
                <p className="text-sm text-foreground bg-background/50 p-3 rounded-md">
                  This chapter covers integrating Google's Gemini AI to generate summaries. We'll set up the Genkit framework, create a server action to call the AI model, and display the summary in our UI.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" /> Code Snippet
                </p>
                <div className="text-xs font-code bg-background/50 p-3 rounded-md">
                  <pre><code><span className="text-blue-400">export async function</span> <span className="text-yellow-400">getSummary</span>(transcript) {"{"}{"\n"}{"  "}<span className="text-purple-400">const</span> {"{"} summary {"}"} = <span className="text-blue-400">await</span> <span className="text-yellow-400">generateSummary</span>({"{ transcript }"});{"\n"}{"  "}<span className="text-purple-400">return</span> summary;{"\n"}{"}"}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimateOnScroll>
  );
}
