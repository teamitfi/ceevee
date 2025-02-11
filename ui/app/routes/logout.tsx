import { redirect } from 'react-router';
import { unsetCookies } from '~/sessions.server';

export async function action() {
  return redirect('/login', { headers: await unsetCookies() });
}

const Logout = () => null;

export default Logout;
