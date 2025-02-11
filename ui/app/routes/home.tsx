import { FrontPage } from '~/routes/frontpage';

export function meta() {
  return [
    { title: 'Ceevee' },
    { name: 'description', content: 'Welcome to Ceevee!' },
  ];
}

export default function Home() {
  return <FrontPage />;
}
