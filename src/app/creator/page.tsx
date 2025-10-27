'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/lib/types';
import CourseList from '@/components/codetube/CourseList';
import CreatorStudio from '@/components/codetube/CreatorStudio';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { collection, doc } from 'firebase/firestore';
import { addCourse, deleteCourse, updateCourse } from '@/lib/courses';
import { useLocalStorage } from '@/hooks/use-local-storage';

export default function CreatorPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const coursesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'courses');
  }, [user, firestore]);
  
  const { data: courses, isLoading: areCoursesLoading } = useCollection<Course>(coursesQuery);
  
  const [activeCourseId, setActiveCourseId] = useLocalStorage<string | null>('activeCourseId', null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // When courses load, if there's an active ID but it's not in the course list (e.g., deleted), reset it.
  useEffect(() => {
    if (!areCoursesLoading && courses && activeCourseId && !courses.some(c => c.id === activeCourseId)) {
        setActiveCourseId(null);
    }
  }, [areCoursesLoading, courses, activeCourseId, setActiveCourseId]);

  if (isUserLoading || !user || areCoursesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const handleSelectCourse = (id: string) => {
    setActiveCourseId(id);
  };

  const handleNewCourse = async () => {
    if (!user || !firestore) return;
    const newCourseData = {
      userId: user.uid,
    };
    const newCourseId = await addCourse(firestore, user.uid, newCourseData);
    if(newCourseId) {
        setActiveCourseId(newCourseId);
    }
  };

  const handleBackToDashboard = () => {
    setActiveCourseId(null);
  };
  
  const handleDeleteCourse = (courseId: string) => {
    if (!user || !firestore) return;
    deleteCourse(firestore, user.uid, courseId);
    if (activeCourseId === courseId) {
      setActiveCourseId(null);
    }
  };
  
  const handleDebouncedCourseUpdate = (courseId: string, courseData: Partial<Course>) => {
    if (!user || !firestore) return;
    updateCourse(firestore, user.uid, courseId, courseData);
  }

  const activeCourse = courses?.find(c => c.id === activeCourseId);
  
  if (!activeCourse) {
    return (
      <CourseList 
        courses={courses || []}
        onSelectCourse={handleSelectCourse}
        onNewCourse={handleNewCourse}
        onDeleteCourse={handleDeleteCourse}
      />
    );
  }

  return (
    <CreatorStudio 
        key={activeCourse.id}
        initialCourse={activeCourse}
        onBackToDashboard={handleBackToDashboard}
        onCourseUpdate={(courseData) => handleDebouncedCourseUpdate(activeCourse.id, courseData)}
    />
  );
}
