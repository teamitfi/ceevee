import { Box } from '@radix-ui/themes';
import type {Route} from '../../.react-router/types/app/routes/+types/login';
import {data} from 'react-router';
import {getAccessTokenCookie} from '~/sessions.server';
import type {User} from '~/routes/login';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const origin = 'http://localhost:4000';
  const accessToken = await getAccessTokenCookie(request);
  const res = await fetch(`${origin}/api/v1/private/users`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      credentials: 'include',
      'Content-Type': 'application/json',
    }
  });
  return data(await res.json());
}

const Projects = ({ loaderData }: Route.ComponentProps) => {
  const users = loaderData as unknown as User[]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <div className="bg-slate-800 p-6 rounded">
        <Box style={{ borderRadius: 'var(--radius-3)' }}>
          List of users:

          <ul className="one m-0 grid list-none gap-x-2.5 p-[22px] sm:w-[500px] sm:grid-cols-[0.75fr_1fr]">

            {users.map((item) => {
              return (
                <li key={item.id}>
                  {item.email}
                </li>
              )
            })}
          </ul>
        </Box>
      </div>
    </div>
  );
};

export default Projects;
