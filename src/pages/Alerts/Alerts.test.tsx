import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Alerts from './Alerts';

afterEach(() => {
  cleanup();
});

describe('Alerts', () => {
  it('renders current trip alerts by default', () => {
    render(<Alerts />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Meldungen & Stoerungen',
      })
    ).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: 'Aktuelle Fahrt' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Aktive Prioritaet' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Umleitungsempfehlung ansehen' })
    ).toBeInTheDocument();
  });

  it('switches to saved routes state when saved routes tab is selected', () => {
    render(<Alerts />);

    fireEvent.click(screen.getByRole('tab', { name: 'Gespeicherte Routen' }));

    expect(screen.getByRole('tab', { name: 'Gespeicherte Routen' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(
      screen.getByRole('heading', { level: 3, name: 'Gespeicherte Routen derzeit stabil' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Auf deinen gespeicherten Routen wurden aktuell keine Stoerungen erkannt.')
    ).toBeInTheDocument();
  });
});
