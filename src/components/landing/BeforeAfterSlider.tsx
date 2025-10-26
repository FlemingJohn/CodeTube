
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Grip, Sparkles, Code, Play, Search, Youtube as YoutubeIcon, Clapperboard, Bell } from 'lucide-react';

const BeforeView = () => (
  <div className="w-full h-full bg-white dark:bg-[#f9f9f9] rounded-lg flex flex-col text-black overflow-hidden font-sans">
    {/* Header */}
    <header className="flex items-center justify-between py-2 px-4 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <YoutubeIcon className="w-8 h-8 text-red-600" />
          <span className="text-xl font-semibold tracking-tighter">YouTube</span>
        </div>
      </div>
      <div className="flex-1 max-w-lg flex items-center">
        <input
          type="text"
          placeholder="Search"
          className="w-full h-10 px-4 border border-gray-300 rounded-l-full focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button className="h-10 px-6 bg-gray-100 border-y border-r border-gray-300 rounded-r-full flex items-center justify-center">
          <Search className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div>
        {/* Placeholder for user icons */}
      </div>
    </header>

    {/* Main Content */}
    <div className="flex-grow flex p-6 gap-6 overflow-hidden">
      {/* Left Column */}
      <div className="w-2/3 flex flex-col gap-4">
        {/* Video Player */}
        <div className="w-full aspect-video bg-red-600 rounded-xl flex items-center justify-center relative">
            <Clapperboard className="w-16 h-16 text-white/80" />
            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-3 py-1.5 rounded-md">
                Skip Ad
            </div>
        </div>
        {/* Title */}
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        {/* Channel Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full shrink-0"></div>
            <div>
              <div className="h-5 bg-gray-300 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-9 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              Subscribe
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-1/3 flex flex-col gap-4">
        {/* Recommended Videos */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="w-2/5 aspect-video bg-gray-300 rounded-lg shrink-0"></div>
            <div className="w-3/5 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
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
          className="relative w-full aspect-[16/10] select-none overflow-hidden rounded-md"
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
