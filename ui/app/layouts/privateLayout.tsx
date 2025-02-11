import { Form, Link, Outlet, redirect } from 'react-router';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Separator from '@radix-ui/react-separator';
import type { Route } from './+types/privateLayout';
import { getSessionCookie } from '~/sessions.server';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionCookie(request);
  if (!session) {
    throw redirect('/login')
  }
}

const PrivateLayout = () => {
  return (
      <div className="flex min-h-screen">
        <NavigationMenu.Root className="w-64 border-r" orientation="vertical">
          <NavigationMenu.List className="p-4 space-y-4">
            {/* Logo */}
            <div className="p-4">
              <span className="text-xl font-bold">Ceevee</span>
            </div>

            <Separator.Root className="h-px" />

            {/* Navigation Items */}
            <NavigationMenu.Item>
              <Link className="block p-2 rounded" to="/dashboard">Dashboard</Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <Link className="block p-2 rounded" to="/projects">Projects</Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <Link className="block p-2 rounded" to="/settings">Settings</Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <Form method="post" action="logout">
                <button className="ml-2 cursor-pointer">Logout</button>
              </Form>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>

        <div className="flex-1 p-8">
          <Outlet />
        </div>
    </div>
  );
}

export default PrivateLayout;