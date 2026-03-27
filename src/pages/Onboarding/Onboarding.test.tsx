import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Onboarding from './Onboarding';

describe('Onboarding', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        return {
          matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        } as MediaQueryList;
      }),
    });
  });

  it('renders the three onboarding blocks with key headings and actions', () => {
    render(<Onboarding />);

    expect(screen.getByText('BF-NAVIGATORE')).toBeInTheDocument();
    expect(screen.getByText('DE')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Ihre barrierefreie Reise\s*beginnt hier/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/Wir gestalten Mobilität grenzenlos\./i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Wie können wir Sie unterstützen?',
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /alles bereit\./i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Jetzt starten' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Route finden ->' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Einrichtung überspringen' })).toBeInTheDocument();

    expect(
      screen.getByText(
        'Wir haben Ihre Präferenzen gespeichert. Sie können nun Ihre erste barrierefreie Reise planen.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Schritt für Schritt barrierefrei')).toBeInTheDocument();

    expect(screen.getAllByRole('list', { name: /fortschritt: schritt [1-3] von 3/i })).toHaveLength(
      3
    );
  });

  it('marks the first mobility option as selected with aria-pressed semantics', () => {
    render(<Onboarding />);

    const mobilityOptionsLists = screen.getAllByLabelText('Mobilitätsoptionen');
    expect(mobilityOptionsLists.length).toBeGreaterThan(0);
    const mobilityOptionsList = mobilityOptionsLists[0];
    expect(mobilityOptionsList).toHaveAttribute('aria-label', 'Mobilitätsoptionen');
    expect(mobilityOptionsList.tagName).toBe('UL');
    const optionCards = within(mobilityOptionsList).getAllByRole('button');

    expect(optionCards).toHaveLength(4);
    expect(
      within(mobilityOptionsList).getByRole('button', { name: /Rollstuhlzugang/i })
    ).toBeInTheDocument();
    expect(
      within(mobilityOptionsList).getByRole('button', { name: /Routen mit Rampen und Aufzügen/i })
    ).toBeInTheDocument();
    expect(
      within(mobilityOptionsList).getByRole('button', { name: /Sehbehinderung/i })
    ).toBeInTheDocument();
    expect(
      within(mobilityOptionsList).getByRole('button', { name: /Taktile Leitsysteme & Ansagen/i })
    ).toBeInTheDocument();
    expect(
      within(mobilityOptionsList).getByRole('button', { name: /Hörbehinderung/i })
    ).toBeInTheDocument();
    expect(
      within(mobilityOptionsList).getByRole('button', { name: /Visuelle Signale & Anzeigen/i })
    ).toBeInTheDocument();
    expect(
      within(mobilityOptionsList).getByRole('button', { name: /Eingeschränkte Mobilität/i })
    ).toBeInTheDocument();
    expect(
      within(mobilityOptionsList).getByRole('button', { name: /Minimale Stufen und kurze Wege/i })
    ).toBeInTheDocument();
    expect(optionCards[0]).toHaveAttribute('aria-pressed', 'true');
    expect(optionCards[1]).toHaveAttribute('aria-pressed', 'false');
    expect(optionCards[2]).toHaveAttribute('aria-pressed', 'false');
    expect(optionCards[3]).toHaveAttribute('aria-pressed', 'false');
  });

  it('scrolls down to step 2 and step 3 when CTA buttons are clicked', () => {
    const scrollIntoViewMock = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      writable: true,
      value: scrollIntoViewMock,
    });

    render(<Onboarding />);
    const stepOneSection = screen
      .getByRole('heading', { level: 1, name: /Ihre barrierefreie Reise/i })
      .closest('section');
    const stepTwoSection = screen
      .getByRole('heading', { level: 2, name: /Wie können wir Sie unterstützen\?/i })
      .closest('section');

    expect(stepOneSection).not.toBeNull();
    expect(stepTwoSection).not.toBeNull();

    fireEvent.click(
      within(stepOneSection as HTMLElement).getByRole('button', { name: 'Jetzt starten' })
    );
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    fireEvent.click(within(stepTwoSection as HTMLElement).getByRole('button', { name: 'Weiter' }));
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(2);
  });
});
