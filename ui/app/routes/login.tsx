import * as Label from '@radix-ui/react-label';
import { Box, Button, Card, Container, Flex, Grid, Text, TextField } from '@radix-ui/themes';
import { type ActionFunctionArgs, data, Form, redirect, useNavigation } from 'react-router';
import type { Route } from './+types/login';
import { getSessionCookie, setCookie, setCookies } from '~/sessions.server';

export interface User {
  id: string;               // Unique ID from database
  cognitoId: string;        // AWS Cognito User ID
  email: string;            // User Email
  roles: ['admin', 'user']; // Roles (e.g., ["user", "admin"])
  createdAt?: string;       // ISO Date format
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = (await getSessionCookie(request)) || {};
  return data({ error: session.error },);
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email && !password) {
    return redirect('/login', { headers: await setCookie({ error: 'Invalid username/password' }) });
  }

  const origin = 'http://localhost:4000';
  const res = await fetch(`${origin}/api/v1/public/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json', credentials: 'include' }
  });

  if (res.status !== 200) {
    return redirect('/login', { headers: await setCookie({ error: 'Invalid username/password' }) });
  }
  return redirect('/dashboard', { headers: await setCookies(await res.json())});
}

const Login = (data: Route.ComponentProps) => {
  const loaderData = data.loaderData;
  const navigation = useNavigation()
  const { error } = loaderData;

  return (
    <Container size="1" className="mt-9">
      <Box maxWidth="400px">
        <Card size="2">
          {error ? <div className="error mb-2">{error}</div> : null}
          <Form method="post">
            <fieldset>
              <Flex direction="column" gap="4">
                <Grid gap="1">
                  <Label.Root>
                    <Text>Email</Text>
                    <TextField.Root name="email" type="email"/>
                  </Label.Root>
                </Grid>
                <Grid gap="1">
                  <Label.Root>
                    <Text>Password</Text>
                    <TextField.Root name="password" type="password"/>
                  </Label.Root>
                </Grid>
                <Grid gap="1">
                  <Button className="cursor-pointer!" loading={navigation.state === 'submitting' || navigation.state === 'loading'} type="submit">Login</Button>
                </Grid>
              </Flex>
            </fieldset>
          </Form>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;
