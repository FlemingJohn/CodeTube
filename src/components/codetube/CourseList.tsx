
'use client';

import { Course } from '@/lib/types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Plus, Trash2 } from 'lucide-react';
import Header from './Header';
import AuthHeader from '../auth/AuthHeader';
import Image from 'next/image';

interface CourseListProps {
  courses: Course[];
  onSelectCourse: (id: string) => void;
  onNewCourse: () => void;
  onDeleteCourse: (id: string) => void;
}

export default function CourseList({ courses, onSelectCourse, onNewCourse, onDeleteCourse }: CourseListProps) {
  return (
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
          <Button onClick={onNewCourse} className="transition-transform hover:scale-105">
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Card key={course.id} className="flex flex-col transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                <CardHeader>
                  <CardTitle className="font-headline line-clamp-2">{course.title}</CardTitle>
                  <CardDescription>{course.chapters.length} {course.chapters.length === 1 ? 'chapter' : 'chapters'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
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
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={() => onSelectCourse(course.id)}>Edit Course</Button>
                  <Button variant="ghost" size="icon" onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCourse(course.id);
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
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
  );
}
