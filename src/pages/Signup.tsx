import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import { useSignup } from '../hooks/useAuth';

const schema = z
  .object({
    invite_code: z.string().min(1, 'Invite code is required'),
    first_name: z.string().min(1, 'Required').max(60),
    last_name: z.string().min(1, 'Required').max(60),
    display_name: z.string().min(2, 'At least 2 characters').max(60),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type FormData = z.infer<typeof schema>;

export default function Signup() {
  const navigate = useNavigate();
  const signupMutation = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await signupMutation.mutateAsync({
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      display_name: data.display_name,
      invite_code: data.invite_code,
    });
    navigate('/dashboard');
  };

  const serverError =
    (signupMutation.error as { response?: { data?: { error?: string } } } | null)?.response?.data
      ?.error ?? (signupMutation.isError ? 'Signup failed. Please try again.' : null);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-navy-900">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo height={140} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-navy-600 dark:bg-navy-800">
          <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Create account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Invite code"
              placeholder="Enter your invite code"
              autoComplete="off"
              error={errors.invite_code?.message}
              {...register('invite_code')}
            />

            {/* First / Last name side by side */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                placeholder="John"
                autoComplete="given-name"
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                label="Last name"
                placeholder="Smith"
                autoComplete="family-name"
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            {/* Display name — what the group sees */}
            <div>
              <Input
                label="Display name"
                placeholder="e.g. Johnny, Big J, The Legend"
                autoComplete="nickname"
                error={errors.display_name?.message}
                {...register('display_name')}
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                This is what your crew sees in the group.
              </p>
            </div>

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
              placeholder="Min 8 characters"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="Same as above"
              autoComplete="new-password"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            {serverError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              loading={isSubmitting || signupMutation.isPending}
              className="mt-1 w-full"
            >
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
