import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sigin-view';

export const metadata: Metadata = {
  title:
    'Tourn.me | trasforma la gestione dei tornei di padel: crea tornei personalizzati, abbina i giocatori in base al loro livello e automatizza tutto il resto. Più semplicità, maggiore efficienza e zero stress per te!',
  description:
    'trasforma la gestione dei tornei di padel: crea tornei personalizzati, abbina i giocatori in base al loro livello e automatizza tutto il resto. Più semplicità, maggiore efficienza e zero stress per te!'
};

export default async function Page() {
  let stars = 3000; // Default value

  try {
    const response = await fetch(
      'https://api.github.com/repos/kiranism/next-shadcn-dashboard-starter',
      {
        next: { revalidate: 3600 }
      }
    );

    if (response.ok) {
      const data = await response.json();
      stars = data.stargazers_count || stars; // Update stars if API response is valid
    }
  } catch (error) {
    console.error('Error fetching GitHub stars:', error);
  }
  return <SignInViewPage stars={stars} />;
}
