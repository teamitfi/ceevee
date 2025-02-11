import { Link } from 'react-router';
import { Container } from '@radix-ui/themes';

export function FrontPage() {
  return (
    <Container size="1" className="mt-9">
      <h1>Welcome to Ceevee, please <Link to="login">Log in</Link></h1>
    </Container>
  );
}