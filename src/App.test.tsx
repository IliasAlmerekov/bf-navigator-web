import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the home route', async () => {
    render(<App />);

    expect(await screen.findByRole('button', { name: 'Find Optimal Route' })).toBeInTheDocument();
  });
});
