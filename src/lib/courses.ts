
'use client';
import { 
    collection, 
    doc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Firestore
} from 'firebase/firestore';
import { Course } from './types';
import { 
    setDocumentNonBlocking,
    updateDocumentNonBlocking,
    deleteDocumentNonBlocking
} from '@/firebase/non-blocking-updates';

/**
 * Adds a new course to Firestore for a specific user.
 *
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user creating the course.
 * @param courseData - The partial course data (title is required).
 * @returns The ID of the newly created course document.
 */
export async function addCourse(firestore: Firestore, userId: string, courseData: Partial<Omit<Course, 'id' | 'userId'>>) {
    const coursesColRef = collection(firestore, 'users', userId, 'courses');
    
    const newDocData = {
      ...courseData,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(coursesColRef, newDocData);
    
    // Also create the initial public copy so it can be shared immediately
    const publicCourseDocRef = doc(firestore, 'courses', docRef.id);
    setDocumentNonBlocking(publicCourseDocRef, newDocData, { merge: true });

    return docRef.id;
}

/**
 * Updates an existing course in Firestore.
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
        ...updateData,
        userId: userId, // Ensure userId is present in public copy
    };
    // Use setDoc with merge to create or update the public document
    setDocumentNonBlocking(publicCourseDocRef, publicData, { merge: true });
}

/**
 * Deletes a course from Firestore.
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
