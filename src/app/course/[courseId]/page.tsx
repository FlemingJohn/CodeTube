
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/index.server';
import { Course } from '@/lib/types';
import CourseViewer from '@/components/codetube/CourseViewer';
import { notFound } from 'next/navigation';
import Header from '@/components/codetube/Header';
import AuthHeader from '@/components/auth/AuthHeader';

// Initialize Firebase on the server
const { firestore } = initializeFirebase();

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

// Fetch data on the server for a specific course
async function getCourse(courseId: string): Promise<Course | null> {
    try {
        const courseRef = doc(firestore, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
            return { ...courseSnap.data(), id: courseSnap.id } as Course;
        }
    } catch (error) {
        console.error("Error fetching course:", error);
    }
    return null;
}

// This is a server component, so we can fetch data directly.
export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = params;
  const course = await getCourse(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
      <main className="flex-1">
        <CourseViewer course={course} />
      </main>
    </div>
  );
}

// Revalidate the page on demand
export const revalidate = 0;
