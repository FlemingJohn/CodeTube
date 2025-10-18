
'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/lib/types';
import CourseList from '@/components/codetube/CourseList';
import CreatorStudio from '@/components/codetube/CreatorStudio';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { addCourse, deleteCourse, updateCourse } from '@/lib/courses';

export default function CreatorPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const coursesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'courses');
  }, [user, firestore]);
  
  const { data: courses, isLoading: areCoursesLoading } = useCollection<Course>(coursesQuery);
  
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

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
      userId: user.uid, // Ensure userId is included
      title: 'New Untitled Course',
      videoId: null,
      chapters: [],
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
  
  const activeCourse = courses?.find(c => c.id === activeCourseId);

  // If there's an active course ID but the course isn't found (e.g., after deletion),
  // go back to the dashboard.
  if (activeCourseId && !activeCourse && !areCoursesLoading) {
    setActiveCourseId(null);
    return (
      <CourseList 
        courses={courses || []}
        onSelectCourse={handleSelectCourse}
        onNewCourse={handleNewCourse}
        onDeleteCourse={handleDeleteCourse}
      />
    );
  }
  
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
        course={activeCourse}
        onBackToDashboard={handleBackToDashboard}
    />
  );
}
