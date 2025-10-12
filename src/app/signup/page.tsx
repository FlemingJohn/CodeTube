import AuthForm from '@/components/auth/AuthForm';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <AuthForm type="signup" />
    </div>
  );
}
