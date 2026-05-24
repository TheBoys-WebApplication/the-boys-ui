import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthContext } from '../store/auth';
import { setAuthToken } from '../lib/axios';

export { useAuthContext } from '../store/auth';

/**
 * Login mutation — calls /auth/login then /auth/me, populates auth context.
 * Navigate on success inside the component using onSuccess or after mutateAsync.
 */
export function useLogin() {
  const { login } = useAuthContext();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data: authData } = await authApi.login(email, password);
      // Set token in the axios module before the /auth/me call.
      setAuthToken(authData.token);
      const { data: userData } = await authApi.me();
      login(authData.token, userData);
      return userData;
    },
  });
}

/**
 * Signup mutation — calls /auth/register then /auth/me, populates auth context.
 */
export function useSignup() {
  const { login } = useAuthContext();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      first_name,
      last_name,
      display_name,
    }: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      display_name: string;
    }) => {
      const { data: authData } = await authApi.register(
        email,
        password,
        first_name,
        last_name,
        display_name,
      );
      setAuthToken(authData.token);
      const { data: userData } = await authApi.me();
      login(authData.token, userData);
      return userData;
    },
  });
}
