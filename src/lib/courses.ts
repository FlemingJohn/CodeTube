
'use client';
import { 
    collection, 
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Course } from './types';
import { 
    addDocumentNonBlocking,
    updateDocumentNonBlocking,
    deleteDocumentNonBlocking
} from '@/firebase/non-blocking-updates';

// This is a simplified set of functions. In a real app, you'd want to
// use the non-blocking versions and handle UI updates optimistically.

/**
 * Adds a new course to Firestore for a specific user.
 *
 * @param userId - The ID of the user creating the course.
 * @param courseData - The partial course data (title is required).
 * @returns The ID of the newly created course document.
 */
export async function addCourse(userId: string, courseData: Partial<Omit<Course, 'id' | 'userId'>>) {
    const firestore = useFirestore();
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
 * @param userId - The ID of the user who owns the course.
 * @param courseId - The ID of the course to update.
 * @param courseData - The partial course data to update.
 */
export function updateCourse(userId: string, courseId: string, courseData: Partial<Omit<Course, 'id' | 'userId'>>) {
    const firestore = useFirestore();
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
 * @param userId - The ID of the user who owns the course.
 * @param courseId - The ID of the course to delete.
 */
export function deleteCourse(userId: string, courseId: string) {
    const firestore = useFirestore();
    const courseDocRef = doc(firestore, 'users', userId, 'courses', courseId);
    deleteDocumentNonBlocking(courseDocRef);
}
