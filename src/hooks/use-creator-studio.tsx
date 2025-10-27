
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

    // This ref helps us avoid sending updates for the initial render.
    const isInitialMount = useRef(true);

    // This effect listens for changes in the local 'course' state
    // and calls the onCourseUpdate prop to persist changes to the database.
    useEffect(() => {
        // We skip the very first render to avoid a redundant update.
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // When the course state changes, we call the persistence function.
        if (course) {
            onCourseUpdate(course);
        }
    }, [course, onCourseUpdate]);

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
