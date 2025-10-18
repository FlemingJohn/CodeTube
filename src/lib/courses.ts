
'use client';
import { 
    collection, 
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Firestore
} from 'firebase/firestore';
import { Course } from './types';
import { 
    updateDocumentNonBlocking,
    deleteDocumentNonBlocking
} from '@/firebase/non-blocking-updates';

// This is a simplified set of functions. In a real app, you'd want to
// use the non-blocking versions and handle UI updates optimistically.

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
    return docRef.id;
}

/**
 * Updates an existing course in Firestore.
 *
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user who owns the course.
 * @param courseId - The ID of the course to update.
 * @param courseData - The partial course data to update.
 */
export function updateCourse(firestore: Firestore, userId: string, courseId: string, courseData: Partial<Omit<Course, 'id' | 'userId'>>) {
    const courseDocRef = doc(firestore, 'users', userId, 'courses', courseId);
    
    const updateData = {
        ...courseData,
        updatedAt: serverTimestamp(),
    };

    updateDocumentNonBlocking(courseDocRef, updateData);
}

/**
 * Deletes a course from Firestore.
 *
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user who owns the course.
 * @param courseId - The ID of the course to delete.
 */
export function deleteCourse(firestore: Firestore, userId: string, courseId: string) {
    const courseDocRef = doc(firestore, 'users', userId, 'courses', courseId);
    deleteDocumentNonBlocking(courseDocRef);
}
