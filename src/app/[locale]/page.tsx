import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sigin-view';

export const metadata: Metadata = {
  title:
    'Tourn.me | trasforma la gestione dei tornei di padel: crea tornei personalizzati, abbina i giocatori in base al loro livello e automatizza tutto il resto. Più semplicità, maggiore efficienza e zero stress per te!',
  description:
    'Tourn.me | trasforma la gestione dei tornei di padel: crea tornei personalizzati, abbina i giocatori in base al loro livello e automatizza tutto il resto. Più semplicità, maggiore efficienza e zero stress per te!'
};

export default async function Page() {
  return <SignInViewPage />;
}
