
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Grip, Play, Sparkles, Code, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react';

const BeforeView = () => (
  <div className="w-full h-full bg-gray-100 dark:bg-zinc-950 rounded-lg flex flex-col text-gray-800 dark:text-gray-200 overflow-hidden">
    {/* Mock Video Player */}
    <div className="w-full aspect-video bg-black flex items-center justify-center shrink-0">
      <Play className="w-16 h-16 text-white/60 hover:text-white/80 transition-colors" />
    </div>
    {/* Mock Video Details & Description */}
    <div className="p-4 space-y-4 overflow-y-auto flex-grow">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">My Awesome Tutorial: Build an App From Scratch</h1>
      
      <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-500 rounded-full shrink-0"></div>
              <div>
                  <p className="font-semibold text-gray-900 dark:text-white">CodeMaster</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">1.2M subscribers</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-200 dark:bg-zinc-800 rounded-full">
                  <button className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-l-full text-sm"><ThumbsUp size={16} /> 25K</button>
                  <div className="w-px h-4 bg-gray-400 dark:bg-zinc-600"></div>
                  <button className="p-1.5 pr-3 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-r-full"><ThumbsDown size={16} /></button>
              </div>
              <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-full text-sm"><Share2 size={16}/> Share</button>
          </div>
      </div>

      <div className="bg-gray-200/70 dark:bg-zinc-900 p-3 rounded-lg text-sm space-y-2">
          <p className='font-semibold'>3M views  1 year ago</p>
          <p>In this video, we will build an amazing app from scratch. Find the chapters below!</p>
          <div className="font-mono text-xs space-y-1">
              <p className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">0:00 - Introduction</p>
              <p className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">2:15 - Setup Project</p>
              <p className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">5:45 - Building the UI</p>
              <p className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">11:30 - State Management</p>
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
  
  const handleInteractionStart = () => setIsDragging(true);
  const handleInteractionEnd = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) handleInteractionEnd();
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging]);


  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardContent className="p-2">
        <div
          ref={containerRef}
          className="relative w-full aspect-video select-none overflow-hidden rounded-md"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        >
          <div className="absolute inset-0">
            <BeforeView />
          </div>
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <AfterView />
          </div>
          <div
            className="absolute top-0 bottom-0 w-1 bg-white mix-blend-difference cursor-ew-resize"
            style={{ left: `calc(${sliderPosition}% - 2px)` }}
            onMouseDown={handleInteractionStart}
            onTouchStart={handleInteractionStart}
          ></div>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg cursor-ew-resize flex items-center justify-center"
            style={{ left: `calc(${sliderPosition}% - 20px)` }}
            onMouseDown={handleInteractionStart}
            onTouchStart={handleInteractionStart}
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
