
import { doc, getDoc, getFirestore } from 'firebase/firestore';
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

// This is a server component, so we can fetch data directly.
export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = params;
  let course: Course | null = null;
  let userId: string | null = null;

  // We need to find the course without knowing the user ID.
  // This is a simplified approach for the demo. In a real app,
  // you might have a separate top-level collection for public courses.
  // For now, we'll assume a structure or find it.
  // A scalable solution would be a separate 'publicCourses' collection.
  // Given the current structure, we can't easily fetch without the userId.
  // Let's assume for this page to work, we'd need a different data model.
  // For the sake of this example, we will not fetch from Firestore here and will show a placeholder.
  // In a real scenario, you'd fetch the course data like this:
  /*
  try {
    // This is pseudo-code because we can't query subcollections without a parent path
    const courseRef = findDocInSubcollections('courses', courseId);
    if (courseRef) {
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists() && courseSnap.data().published) {
            course = { id: courseSnap.id, ...courseSnap.data() } as Course;
        }
    }
  } catch (error) {
    console.error("Error fetching course:", error);
  }

  if (!course) {
    // For now, we just show not found
    notFound();
  }
  */

  // Since we cannot fetch the course without a user ID with the current structure,
  // we'll display a message. A real implementation would require a change
  // to the Firestore data model, such as a top-level `courses` collection.

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
      <main className="flex-1 container py-8">
        <div className="text-center">
            <h1 className="text-2xl font-bold">Public Course View</h1>
            <p className="text-muted-foreground">This feature is under construction.</p>
            <p className="mt-4">
                Displaying a public course would require a change to the database structure.
                Currently, courses are stored under a user's private space
                (<code>/users/&#123;userId&#125;/courses/&#123;courseId&#125;</code>),
                making them inaccessible without knowing the user's ID.
            </p>
             <p className="mt-2">
                To implement this correctly, a top-level <code>/courses</code> collection would be needed.
            </p>
        </div>
      </main>
    </div>
  );
}

// Revalidate the page on demand
export const revalidate = 0;
