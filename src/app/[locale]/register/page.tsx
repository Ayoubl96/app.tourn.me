import { Metadata } from 'next';
import RegistrationViewPage from '@/features/auth/components/registration-view';

export const metadata: Metadata = {
  title: 'Create Account | tourn.me',
  description:
    'Create your company account to start managing tournaments with tourn.me'
};

export default function RegisterPage() {
  return <RegistrationViewPage />;
}
