import { auth } from '@/lib/auth';
import { redirect } from '@/lib/navigation';

export default async function Tournament() {
  const session = await auth();

  if (!session?.user) {
    return redirect('/');
  }

  // Redirect to tournament overview within dashboard
  return redirect('/dashboard/tournament/overview');
}
