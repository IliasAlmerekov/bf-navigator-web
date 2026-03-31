import { cleanup, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const HAS_COMPLETED_ONBOARDING_STORAGE_KEY = 'bf-navigator-completed-onboarding';

async function renderAppAt(pathname: string) {
  cleanup();
  window.history.pushState({}, '', pathname);
  vi.resetModules();
  const { default: App } = await import('./App');
  render(<App />);
}

describe('App', () => {
  it('redirects the root route to onboarding until onboarding is completed', async () => {
    window.localStorage.removeItem(HAS_COMPLETED_ONBOARDING_STORAGE_KEY);

    await renderAppAt('/');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Ihre barrierefreie Reise\s*beginnt hier/i,
      })
    ).toBeInTheDocument();
  }, 15000);

  it('renders the home route when onboarding has already been completed', async () => {
    window.localStorage.setItem(HAS_COMPLETED_ONBOARDING_STORAGE_KEY, 'true');

    await renderAppAt('/');

    expect(
      await screen.findByRole('button', { name: 'Optimale Route finden' })
    ).toBeInTheDocument();
  }, 15000);

  it('renders the onboarding route at /onboarding', async () => {
    await renderAppAt('/onboarding');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Ihre barrierefreie Reise\s*beginnt hier/i,
      })
    ).toBeInTheDocument();
  }, 15000);

  it('renders train search results from route search params', async () => {
    await renderAppAt(
      '/train-search-results?originEva=8000207&originName=K%C3%B6ln%20Hbf&destinationEva=8010096&destinationName=Dresden%20Hbf&date=2026-04-02&time=13%3A45'
    );

    expect(
      (
        await screen.findAllByRole('heading', {
          name: /suchergebnisse: zugverbindungen/i,
        })
      )[0]
    ).toBeInTheDocument();
    const [summaryRegion] = await screen.findAllByRole('region', {
      name: /suchanfrage zusammenfassung/i,
    });

    expect(summaryRegion).toBeInTheDocument();
    expect(summaryRegion).toHaveTextContent(/(Köln Hbf|Hamburg Hbf)/i);
    expect(summaryRegion).toHaveTextContent(/(Dresden Hbf|Berlin Hbf)/i);
    expect(summaryRegion).toHaveTextContent(/(2026-04-02|26\.\s*Mär\.)/i);
  }, 15000);
});
