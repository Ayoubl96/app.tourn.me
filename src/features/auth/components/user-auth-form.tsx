'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';

export default function UserAuthForm() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();

  const formSchema = z.object({
    username: z.string().min(1, { message: t('Errors.requiredUsername') }),
    password: z.string().min(1, { message: t('Errors.requiredPassword') })
  });

  type UserFormValue = z.infer<typeof formSchema>;

  const defaultValues = {
    username: '',
    password: ''
  };

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          username: data.username,
          password: data.password,
          redirect: false
        });

        if (result?.error) {
          // Authentication failed
          if (result.error === 'CredentialsSignin') {
            toast.error(t('Errors.authenticationFailed'));
          } else {
            toast.error(t('Errors.signInError'));
          }
        } else if (result?.ok) {
          // Authentication successful
          toast.success(t('Auth.signInSuccess'));
          // Redirect manually since we set redirect: false
          window.location.href = callbackUrl ?? '/dashboard';
        } else {
          // Unexpected result
          toast.error(t('Errors.signInError'));
        }
      } catch (error) {
        // Network or other errors
        console.error('Sign in error:', error);
        toast.error(t('Errors.signInError'));
      }
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-4'
        >
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Auth.usernameLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder={t('Auth.usernamePlaceholder')}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Auth.passwordLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('Auth.passwordPlaceholder')}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex items-center justify-end'>
            <Link
              href='/forgot-password'
              className='text-sm text-primary hover:underline'
            >
              {t('Auth.forgotPassword')}
            </Link>
          </div>

          <Button disabled={loading} className='w-full' type='submit'>
            {t('Auth.continueWithEmail')}
          </Button>
        </form>
      </Form>
    </>
  );
}
