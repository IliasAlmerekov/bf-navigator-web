import { cleanup, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

async function renderAppAt(pathname: string) {
  cleanup();
  window.history.pushState({}, '', pathname);
  vi.resetModules();
  const { default: App } = await import('./App');
  render(<App />);
}

describe('App', () => {
  it('renders the home route', async () => {
    await renderAppAt('/');

    expect(await screen.findByRole('button', { name: 'Find Optimal Route' })).toBeInTheDocument();
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

  it('renders train search results from route search params', async () => {
    await renderAppAt(
      '/train-search-results?originEva=8000207&originName=K%C3%B6ln%20Hbf&destinationEva=8010096&destinationName=Dresden%20Hbf&date=2026-04-02&time=13%3A45'
    );

    expect(
      (
        await screen.findAllByRole('heading', {
          name: /suchergebnisse: zugverbindungen von köln hbf nach dresden hbf/i,
        })
      )[0]
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', {
        name: /suchanfrage zusammenfassung/i,
      })
    ).toHaveTextContent('Köln Hbf');
    expect(
      screen.getByRole('region', {
        name: /suchanfrage zusammenfassung/i,
      })
    ).toHaveTextContent('Dresden Hbf');
    expect(
      screen.getByRole('region', {
        name: /suchanfrage zusammenfassung/i,
      })
    ).toHaveTextContent('2026-04-02');
    expect(
      screen.getByRole('region', {
        name: /suchanfrage zusammenfassung/i,
      })
    ).toHaveTextContent('13:45');
  });
});
