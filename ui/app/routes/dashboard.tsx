import { Box, Container } from '@radix-ui/themes';
import { Tabs } from 'radix-ui';
import { data } from 'react-router';
import type { Route } from './+types/dashboard';
import { getSessionCookie } from '~/sessions.server';

export async function loader({ request }: Route.LoaderArgs) {
  return data(await getSessionCookie(request));
}

const Dashboard = ({ loaderData }: Route.ComponentProps) => {
  const { email } = loaderData;
  return (
    <div>
      {/* Tabs Section */}
      <Tabs.Root defaultValue="overview" className="mb-8">
        <Tabs.List className="flex border-b border-slate-800 mb-4">
          <Tabs.Trigger
            value="overview"
            className="px-4 py-2 text-slate-50 hover:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
          >
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="analytics"
            className="px-4 py-2 text-slate-50 hover:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
          >
            Analytics
          </Tabs.Trigger>
          <Tabs.Trigger
            value="reports"
            className="px-4 py-2 text-slate-50 hover:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
          >
            Reports
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      <h1 className="text-2xl font-bold mb-4">Welcome {email}</h1>
      <div className="bg-slate-800 p-6 rounded">
        <Box style={{ borderRadius: 'var(--radius-3)' }}>
          <Container size="1" />
        </Box>
      </div>
    </div>
  );
};

export default Dashboard;
