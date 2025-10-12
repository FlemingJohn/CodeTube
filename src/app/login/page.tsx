import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <AuthForm type="login" />
    </div>
  );
}
