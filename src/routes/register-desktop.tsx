import { createFileRoute } from '@tanstack/react-router';
import RegisterDesktop from '../pages/RegisterDesktop';

export const Route = createFileRoute('/register-desktop')({
  component: RegisterDesktop,
});
