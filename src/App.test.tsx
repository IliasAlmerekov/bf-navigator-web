import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

async function renderAppAt(pathname: string) {
  window.history.pushState({}, '', pathname);
  vi.resetModules();
  const { default: App } = await import('./App');
  render(<App />);
}

describe('App', () => {
  it('renders the home route', async () => {
    await renderAppAt('/');

    expect(await screen.findByText('HomeSearch')).toBeInTheDocument();
  });

  it('renders the onboarding route at /onboarding', async () => {
    await renderAppAt('/onboarding');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Ihre barrierefreie Reise\s*beginnt hier/i,
      })
    ).toBeInTheDocument();
  });
});
