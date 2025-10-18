
'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Chapter, Course } from '@/lib/types';
import CourseList from '@/components/codetube/CourseList';
import CreatorStudio from '@/components/codetube/CreatorStudio';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CreatorPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [courses, setCourses] = useLocalStorage<Course[]>('codetube-courses', []);
  const [activeCourseId, setActiveCourseId] = useLocalStorage<string | null>('codetube-active-course', null);
  const [isNewCourse, setIsNewCourse] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const handleSelectCourse = (id: string) => {
    setActiveCourseId(id);
    setIsNewCourse(false);
  };

  const handleNewCourse = () => {
    const newCourse: Course = {
      id: `course_${Date.now()}`,
      title: 'New Untitled Course',
      videoId: null,
      chapters: [],
    };
    setCourses(prev => [...prev, newCourse]);
    setActiveCourseId(newCourse.id);
    setIsNewCourse(true);
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
    if (activeCourseId === id) {
      setActiveCourseId(null);
    }
  };

  const handleBackToDashboard = () => {
    setActiveCourseId(null);
    setIsNewCourse(false);
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };
  
  const activeCourse = courses.find(c => c.id === activeCourseId);

  if (!activeCourse) {
    return (
      <CourseList 
        courses={courses}
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
        onCourseUpdate={handleUpdateCourse}
        onBackToDashboard={handleBackToDashboard}
        isNewCourse={isNewCourse}
    />
  );
}
