import {type RouteConfig, index, route, layout} from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('logout', 'routes/logout.tsx'),
  layout('layouts/privateLayout.tsx', [
    route('dashboard', 'routes/dashboard.tsx'),
    route('projects', 'routes/projects.tsx'),
    route('settings', 'routes/settings.tsx')
  ]),

] satisfies RouteConfig;
