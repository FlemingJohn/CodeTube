
'use client';
import { 
    collection, 
    doc,
    serverTimestamp,
    Firestore
} from 'firebase/firestore';
import { Course } from './types';
import { 
    setDocumentNonBlocking,
    updateDocumentNonBlocking,
    deleteDocumentNonBlocking,
    addDocumentNonBlocking
} from '@/firebase/non-blocking-updates';

/**
 * Adds a new course to Firestore for a specific user in a non-blocking manner.
 *
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user creating the course.
 * @param courseData - The partial course data.
 * @returns The ID of the newly created course document, generated client-side.
 */
export function addCourse(firestore: Firestore, userId: string, courseData: Partial<Omit<Course, 'id'>>): string {
    const coursesColRef = collection(firestore, 'users', userId, 'courses');
    
    // Generate a new document reference with an auto-generated ID client-side
    const newCourseRef = doc(coursesColRef);
    const newCourseId = newCourseRef.id;

    const newDocData: Omit<Course, 'id'> = {
      userId: userId,
      title: 'New Untitled Course',
      videoId: null,
      chapters: [],
      category: 'General',
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Use non-blocking set to create the private course document
    setDocumentNonBlocking(newCourseRef, newDocData);

    // Also create the initial public copy non-blockingly
    const publicCourseDocRef = doc(firestore, 'courses', newCourseId);
    const publicDataWithTimestamps = {
        ...newDocData,
        // Ensure timestamps are set for the public doc as well
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    setDocumentNonBlocking(publicCourseDocRef, publicDataWithTimestamps, { merge: true });

    return newCourseId;
}


/**
 * Updates an existing course in Firestore in a non-blocking manner.
 * This function also handles creating/updating a public-facing copy.
 *
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user who owns the course.
 * @param courseId - The ID of the course to update.
 * @param courseData - The partial course data to update.
 */
export function updateCourse(firestore: Firestore, userId: string, courseId: string, courseData: Partial<Omit<Course, 'id' | 'userId'>>) {
    const userCourseDocRef = doc(firestore, 'users', userId, 'courses', courseId);
    
    const updateData = {
        ...courseData,
        updatedAt: serverTimestamp(),
    };
    
    // Update the user's private copy of the course
    updateDocumentNonBlocking(userCourseDocRef, updateData);

    // Always update the public copy to keep it in sync
    const publicCourseDocRef = doc(firestore, 'courses', courseId);
    const publicData = {
        userId: userId, // Ensure userId is always present in public copy
        ...updateData,
    };
    // Use setDoc with merge to create or update the public document
    setDocumentNonBlocking(publicCourseDocRef, publicData, { merge: true });
}

/**
 * Deletes a course from Firestore in a non-blocking manner.
 *
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user who owns the course.
 * @param courseId - The ID of the course to delete.
 */
export function deleteCourse(firestore: Firestore, userId: string, courseId: string) {
    const userCourseDocRef = doc(firestore, 'users', userId, 'courses', courseId);
    deleteDocumentNonBlocking(userCourseDocRef);

    // Also delete the public copy if it exists
    const publicCourseDocRef = doc(firestore, 'courses', courseId);
    deleteDocumentNonBlocking(publicCourseDocRef);
}

    