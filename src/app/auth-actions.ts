'use server';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase-admin/auth';
import { getApp } from 'firebase-admin/app';
import { z } from 'zod';
import { initializeAdminApp } from '@/firebase/admin';

initializeAdminApp();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(values: z.infer<typeof authSchema>) {
  const validatedFields = authSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password } = validatedFields.data;

  try {
    const auth = getAuth(getApp());
    const userCredential = await signInWithEmailAndPassword(
      // @ts-expect-error - Firebase SDK types mismatch
      auth,
      email,
      password
    );
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any) {
    return { error: error.message || 'Failed to sign in.' };
  }
}

export async function signup(values: z.infer<typeof authSchema>) {
  const validatedFields = authSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }
  const { email, password } = validatedFields.data;

  try {
    const auth = getAuth(getApp());
    const userCredential = await createUserWithEmailAndPassword(
      // @ts-expect-error - Firebase SDK types mismatch
      auth,
      email,
      password
    );
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any) {
    return { error: error.message || 'Failed to sign up.' };
  }
}
