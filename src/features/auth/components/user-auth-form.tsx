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
import GithubSignInButton from './github-auth-button';
import { useTranslations } from 'next-intl';

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
    startTransition(() => {
      signIn('credentials', {
        username: data.username,
        password: data.password,
        callbackUrl: callbackUrl ?? '/dashboard'
      });
      toast.success(t('Auth.signInSuccess'));
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-2'
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

          <Button disabled={loading} className='ml-auto w-full' type='submit'>
            {t('Auth.continueWithEmail')}
          </Button>
        </form>
      </Form>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            {t('Auth.orContinueWith')}
          </span>
        </div>
      </div>
      <GithubSignInButton />
    </>
  );
}
