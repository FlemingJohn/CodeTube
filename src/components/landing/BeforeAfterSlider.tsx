
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Grip, Play, Sparkles, Code, ThumbsUp, ThumbsDown, Share2, Download, Bookmark, Bell, ChevronDown } from 'lucide-react';
import Image from 'next/image';

const BeforeView = () => (
  <div className="w-full h-full bg-gray-100 dark:bg-[#0f0f0f] rounded-lg flex flex-col text-white overflow-hidden">
    {/* Mock Video Player */}
    <div className="w-full aspect-video bg-black flex items-center justify-center shrink-0 relative">
      {/* A simple placeholder to represent a video is playing */}
      <div className="w-1/2 h-1/2 bg-gray-900 rounded-lg flex items-center justify-center text-gray-600">
        Video Player
      </div>
    </div>
    
    {/* Mock Video Details & Description */}
    <div className="p-4 space-y-4 overflow-y-auto flex-grow text-sm">
      <h1 className="text-xl font-bold">Java Full Course for free ☕ (2025)</h1>
      
      <div className="flex items-center justify-between flex-wrap gap-y-3">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full shrink-0 flex items-center justify-center font-bold">
                BC
              </div>
              <div>
                  <p className="font-semibold text-white flex items-center gap-1">Bro Code <CheckCircleIcon className="w-3.5 h-3.5" /></p>
                  <p className="text-xs text-gray-400">2.94M subscribers</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-800 hover:bg-gray-700 rounded-full px-4 py-2 cursor-pointer">
              <Bell className="w-5 h-5"/>
              <span className="ml-2 hidden sm:inline">Subscribed</span>
              <ChevronDown className="w-5 h-5 ml-1"/>
            </div>
          </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center bg-gray-800 rounded-full">
            <button className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 hover:bg-gray-700 rounded-l-full text-sm"><ThumbsUp size={18} /> 45K</button>
            <div className="w-px h-5 bg-gray-600"></div>
            <button className="p-1.5 pr-3 hover:bg-gray-700 rounded-r-full"><ThumbsDown size={18} /></button>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm"><Share2 size={18}/> Share</button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm"><Download size={18}/> Download</button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm"><Bookmark size={18}/> Save</button>
      </div>

      <div className="bg-gray-800 p-3 rounded-lg text-sm space-y-2">
          <p className='font-semibold'>2,343,226 views  2 Jan 2025 <span className="text-blue-400">#java #javatutorial #javacourse</span></p>
          <p className="text-gray-300">Java tutorial for beginners full course 2025</p>
          <div className="font-sans text-sm space-y-1 pt-2">
              <p className="text-blue-400 hover:underline cursor-pointer">#1 00:00:00 introduction to java 👋</p>
              <p className="text-blue-400 hover:underline cursor-pointer">#2 00:10:58 variables ❎</p>
              <p className="text-blue-400 hover:underline cursor-pointer">#3 00:31:30 user input ⌨️</p>
              <p className="text-blue-400 hover:underline cursor-pointer">#4 00:47:25 mad libs game 📕</p>
          </div>
      </div>
    </div>
  </div>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.06-1.06l-3.25 3.25-1.5-1.5a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l3.75-3.75z" clipRule="evenodd" />
  </svg>
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
