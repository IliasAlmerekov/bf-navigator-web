import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SearchSummaryBar } from './SearchSummaryBar';

describe('SearchSummaryBar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders origin and destination as separate summary stops for narrow screens', () => {
    render(
      <SearchSummaryBar
        date="2026-04-02"
        time="08:15"
        originName="Hamburg Hauptbahnhof mit einem sehr langen Startnamen"
        destinationName="München Hauptbahnhof mit einem sehr langen Zielnamen"
        resultCount={8}
        onChangeSearch={vi.fn()}
      />
    );

    expect(screen.getByText('Von')).toBeInTheDocument();
    expect(screen.getByText('Nach')).toBeInTheDocument();
    expect(
      screen.getByText('Hamburg Hauptbahnhof mit einem sehr langen Startnamen')
    ).toBeInTheDocument();
    expect(
      screen.getByText('München Hauptbahnhof mit einem sehr langen Zielnamen')
    ).toBeInTheDocument();
  });
});
