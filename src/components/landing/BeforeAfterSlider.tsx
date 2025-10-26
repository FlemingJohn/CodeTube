
'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Grip, Play, Sparkles, Code } from 'lucide-react';

const BeforeView = () => (
  <div className="w-full h-full bg-gray-100 dark:bg-slate-900 rounded-lg flex flex-col p-4 text-gray-800 dark:text-white overflow-hidden">
    {/* Mock Video Player */}
    <div className="w-full aspect-video bg-black rounded-md flex items-center justify-center mb-4 shrink-0 shadow-lg">
        <Play className="w-16 h-16 text-white/70 hover:text-white/90 transition-colors" />
    </div>
    {/* Mock Video Description */}
    <div className='space-y-3 overflow-y-auto pr-2 text-sm flex-grow'>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">My Awesome Tutorial</h3>
        <div className="bg-gray-200/70 dark:bg-slate-800 p-3 rounded-md">
            <p className='text-gray-700 dark:text-slate-300'>In this video, we will build an amazing app from scratch. Find the chapters below!</p>
            <div className="mt-3 pt-3 border-t border-gray-300 dark:border-slate-700">
                <p className="text-blue-600 dark:text-sky-400 font-mono">0:00 - Introduction</p>
                <p className="text-blue-600 dark:text-sky-400 font-mono">2:15 - Setup Project</p>
                <p className="text-blue-600 dark:text-sky-400 font-mono">5:45 - Building the UI</p>
                <p className="text-blue-600 dark:text-sky-400 font-mono">11:30 - State Management</p>
            </div>
        </div>
    </div>
  </div>
);

const AfterView = () => (
  <div className="w-full h-full bg-background rounded-lg flex overflow-hidden">
    <div className="w-1/3 border-r border-border p-4 space-y-4 shrink-0">
      <h3 className="text-sm font-semibold text-muted-foreground">CHAPTERS</h3>
      <div className="space-y-2">
        <div className="bg-primary/10 text-primary p-2 rounded-md">
          <p className="text-sm font-medium">1. Introduction</p>
          <p className="text-xs text-primary/80">00:00</p>
        </div>
        <div className="hover:bg-accent p-2 rounded-md cursor-pointer">
          <p className="text-sm font-medium">2. Setup Project</p>
          <p className="text-xs text-muted-foreground">02:15</p>
        </div>
        <div className="hover:bg-accent p-2 rounded-md cursor-pointer">
          <p className="text-sm font-medium">3. Building the UI</p>
          <p className="text-xs text-muted-foreground">05:45</p>
        </div>
      </div>
    </div>
    <div className="w-2/3 p-4 space-y-4 overflow-y-auto">
       <h2 className="text-xl font-bold font-headline">Chapter Details</h2>
       <div className="space-y-2">
           <p className="text-sm font-medium flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> AI-Generated Summary</p>
           <p className="text-sm text-muted-foreground bg-secondary/50 p-2 rounded-md">This chapter introduces the project and what will be built...</p>
       </div>
       <div className="space-y-2">
           <p className="text-sm font-medium flex items-center gap-2"><Code className="w-4 h-4 text-primary" /> Code Snippet</p>
           <div className="text-xs font-code bg-secondary/50 p-2 rounded-md">
               <span className="text-blue-400">const</span> App = () => ( ... );
           </div>
       </div>
    </div>
  </div>
);


export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((clientX - rect.left) / rect.width) * 100;
    if (newPosition >= 0 && newPosition <= 100) {
      setSliderPosition(newPosition);
    }
  };
  
  const handleMouseDown = () => setIsDragging(true);
  
  const handleMouseUp = () => {
    if (isDragging) setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardContent className="p-2">
        <div
          ref={containerRef}
          className="relative w-full aspect-video select-none overflow-hidden rounded-md"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          onTouchCancel={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          <div className="absolute inset-0">
            <BeforeView />
          </div>
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${'100' - sliderPosition}% 0 0)` }}
          >
            <AfterView />
          </div>
          <div
            className="absolute top-0 bottom-0 w-1 bg-white mix-blend-difference cursor-ew-resize"
            style={{ left: `calc(${sliderPosition}% - 2px)` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          ></div>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg cursor-ew-resize flex items-center justify-center"
            style={{ left: `calc(${sliderPosition}% - 20px)` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
             <Grip className="w-5 h-5 text-slate-600" />
          </div>

          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-semibold py-1 px-2 rounded-full pointer-events-none">
            BEFORE
          </div>
          <div 
            className="absolute top-2 right-2 bg-black/50 text-white text-xs font-semibold py-1 px-2 rounded-full pointer-events-none"
            style={{ opacity: sliderPosition > 60 ? 1 : 0, transition: 'opacity 0.2s' }}
          >
            AFTER
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
