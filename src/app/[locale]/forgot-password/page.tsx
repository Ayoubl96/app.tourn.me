import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/lib/navigation';
import AuthSideImage from '@/features/auth/components/auth-side-image';
import AuthHeader from '@/features/auth/components/auth-header';
import { notFound } from 'next/navigation';
import { locales } from '@/config/locales';
import { unstable_setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Forgot Password | tourn.me'
};

// Generate static params for locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ForgotPasswordPage({ params }: PageProps) {
  // Await params and validate locale
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering by setting the request locale
  unstable_setRequestLocale(locale);

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <AuthHeader variant='forgot-password' />
      <AuthSideImage />
      <div className='flex h-full items-center p-4 lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Reset Password
            </h1>
            <p className='text-sm text-muted-foreground'>
              Enter your email address and we&apos;ll send you a link to reset
              your password
            </p>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='Enter your email address...'
              />
            </div>
            <Button className='w-full'>Send Reset Link</Button>
          </div>

          <div className='text-center'>
            <Link href='/' className='text-sm text-primary hover:underline'>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
