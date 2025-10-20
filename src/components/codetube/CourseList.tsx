
'use client';

import { Course } from '@/lib/types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Plus, Trash2, Mic, Share2, Wand2 } from 'lucide-react';
import Header from './Header';
import AuthHeader from '../auth/AuthHeader';
import Image from 'next/image';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import PracticePitchDialog from './PracticePitchDialog';
import ShareDialog from './ShareDialog';
import Link from 'next/link';

interface CourseListProps {
  courses: Course[];
  onSelectCourse: (id: string) => void;
  onNewCourse: () => void;
  onDeleteCourse: (id: string) => void;
}

const categoryColors: { [key: string]: string } = {
    'Programming': 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
    'Web Development': 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30',
    'Mobile Development': 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
    'Data Science': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
    'AI/ML': 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    'DevOps': 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
    'Game Development': 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
    'General': 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30',
  };
  

export default function CourseList({ courses, onSelectCourse, onNewCourse, onDeleteCourse }: CourseListProps) {
  const [selectedCourseForPitch, setSelectedCourseForPitch] = useState<Course | null>(null);
  const [selectedCourseForShare, setSelectedCourseForShare] = useState<Course | null>(null);

  const calculateProgress = (course: Course) => {
    if (!course.chapters || course.chapters.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    const completed = course.chapters.filter(c => c.summary && c.summary.trim() !== '').length;
    const total = course.chapters.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  };

  const openPitchDialog = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCourseForPitch(course);
  };
  
  const openShareDialog = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCourseForShare(course);
  };

  const handleDelete = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteCourse(courseId);
  }

  return (
    <>
      <div className="min-h-screen bg-muted/20">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center">
            <div className="mr-auto md:mr-4 flex">
              <Header />
            </div>
            <div className="flex items-center justify-end ml-auto">
              <AuthHeader />
            </div>
          </div>
        </header>

        <main className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">My Courses</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/creator/playground">
                  <Wand2 className="mr-2 h-4 w-4" />
                  AI Playground
                </Link>
              </Button>
              <Button onClick={onNewCourse} className="transition-transform hover:scale-105">
                <Plus className="mr-2 h-4 w-4" />
                New Course
              </Button>
            </div>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => {
                  const progress = calculateProgress(course);
                  const category = course.category || 'General';
                  return (
                    <Card 
                      key={course.id} 
                      onClick={() => onSelectCourse(course.id)}
                      className="flex flex-col cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="font-headline line-clamp-2">{course.title}</CardTitle>
                          <Badge variant="outline" className={cn("whitespace-nowrap", categoryColors[category])}>{category}</Badge>
                        </div>
                        <CardDescription>{course.chapters.length} {course.chapters.length === 1 ? 'chapter' : 'chapters'}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                        <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                              {course.videoId ? (
                                  <Image 
                                      src={`https://i.ytimg.com/vi/${course.videoId}/mqdefault.jpg`} 
                                      alt={course.title}
                                      fill
                                      style={{ objectFit: 'cover' }}
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  />
                              ): (
                                  <p className="text-sm text-muted-foreground">No video</p>
                              )}
                        </div>
                        {progress.total > 0 && (
                          <div className='space-y-2'>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>{progress.completed} / {progress.total}</span>
                            </div>
                            <Progress value={progress.percentage} />
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={(e) => openShareDialog(course, e)}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => openPitchDialog(course, e)}>
                            <Mic className="h-4 w-4 mr-2" />
                            Practice
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => handleDelete(course.id, e)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  )
              })}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <h2 className="text-xl font-semibold text-muted-foreground">No courses yet!</h2>
              <p className="text-muted-foreground mt-2">Click "New Course" to start creating.</p>
              <Button onClick={onNewCourse} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Course
              </Button>
            </div>
          )}
        </main>
      </div>

      {selectedCourseForPitch && (
        <PracticePitchDialog
            isOpen={!!selectedCourseForPitch}
            setIsOpen={() => setSelectedCourseForPitch(null)}
            course={selectedCourseForPitch}
        />
      )}
      {selectedCourseForShare && (
        <ShareDialog
          isOpen={!!selectedCourseForShare}
          setIsOpen={() => setSelectedCourseForShare(null)}
          course={selectedCourseForShare}
        />
      )}
    </>
  );
}
