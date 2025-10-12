'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../codetube/Header';
import { useAuth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type AuthFormProps = {
  type: 'login' | 'signup';
};

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        if (type === 'login') {
          await signInWithEmailAndPassword(auth, values.email, values.password);
        } else {
          await createUserWithEmailAndPassword(auth, values.email, values.password);
        }
        toast({
          title: type === 'login' ? 'Login Successful' : 'Signup Successful',
          description: `Welcome! Redirecting you now...`,
        });
        router.push('/creator');
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: error.message || 'An unexpected error occurred.',
        });
      }
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Header />
        </div>
        <CardTitle className="text-2xl font-headline">
          {type === 'login' ? 'Welcome Back' : 'Create an Account'}
        </CardTitle>
        <CardDescription>
          {type === 'login'
            ? 'Sign in to continue to your creator studio.'
            : 'Get started by creating a new account.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === 'login' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {type === 'login' ? (
            <p>
              Don't have an account?{' '}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
