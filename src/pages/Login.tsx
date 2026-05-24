import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import { useLogin } from '../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await loginMutation.mutateAsync({ email: data.email, password: data.password });
    navigate('/');
  };

  const serverError =
    (loginMutation.error as { response?: { data?: { error?: string } } } | null)?.response?.data
      ?.error ?? (loginMutation.isError ? 'Login failed. Check your credentials.' : null);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-navy-900">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo — large, centred, swaps with theme */}
        <div className="mb-8 flex justify-center">
          <Logo height={140} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-navy-600 dark:bg-navy-800">
          <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">Sign in</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              loading={isSubmitting || loginMutation.isPending}
              className="mt-1 w-full"
            >
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
