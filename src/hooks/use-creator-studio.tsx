
'use client';

import { Course } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

type CreatorStudioContextType = {
    course: Course | null;
    setCourse: React.Dispatch<React.SetStateAction<Course | null>>;
    player: any | null;
    setPlayer: React.Dispatch<React.SetStateAction<any | null>>;
};

const CreatorStudioContext = createContext<CreatorStudioContextType | undefined>(undefined);

interface CreatorStudioProviderProps {
    children: ReactNode;
    initialCourse: Course;
    onCourseUpdate: (updatedCourse: Partial<Course>) => void;
}

export function CreatorStudioProvider({ children, initialCourse, onCourseUpdate }: CreatorStudioProviderProps) {
    const [course, setCourse] = useState<Course | null>(initialCourse);
    const [player, setPlayer] = useState<any | null>(null);

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (course) {
            onCourseUpdate(course);
        }
    }, [course, onCourseUpdate]);
    
    // This effect synchronizes the internal state only when the course ID changes.
    // This prevents the component from re-rendering on every content update.
    useEffect(() => {
      if (initialCourse && course?.id !== initialCourse.id) {
          setCourse(initialCourse);
      }
    }, [initialCourse, course?.id]);


    return (
        <CreatorStudioContext.Provider value={{ course, setCourse, player, setPlayer }}>
            {children}
        </CreatorStudioContext.Provider>
    );
}

export function useCreatorStudio() {
    const context = useContext(CreatorStudioContext);
    if (context === undefined) {
        throw new Error('useCreatorStudio must be used within a CreatorStudioProvider');
    }
    return context;
}
