import { Metadata } from 'next';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/lib/navigation';

export const metadata: Metadata = {
  title: 'Forgot Password | tourn.me'
};

export default function ForgotPasswordPage() {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
        <div className='absolute inset-0 bg-zinc-900' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Logo width={120} height={32} className='mr-2' />
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Reset your password securely and get back to managing your
              tournaments.&rdquo;
            </p>
            <footer className='text-sm'>tourn.me Team</footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center p-4 lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Reset Password
            </h1>
            <p className='text-sm text-muted-foreground'>
              Enter your email address and we'll send you a link to reset your
              password
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
