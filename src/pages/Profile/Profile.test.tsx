import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import Profile from './Profile';

afterEach(() => {
  cleanup();
});

describe('Profile', () => {
  it('renders the profile and preferences sections', () => {
    render(<Profile />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Profile & Mobility',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Mobility Assistance' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Travel Comfort' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Preferences' })).toBeInTheDocument();
  });

  it('lets users update mobility, comfort, distance and pace settings', async () => {
    const user = userEvent.setup();
    render(<Profile />);

    const strollerButton = screen.getByRole('button', { name: 'Stroller' });
    await user.click(strollerButton);
    expect(strollerButton).toHaveAttribute('aria-pressed', 'true');

    const lowFloorSwitch = screen.getByRole('switch', { name: 'Low-floor Boarding' });
    expect(lowFloorSwitch).toHaveAttribute('aria-checked', 'false');
    await user.click(lowFloorSwitch);
    expect(lowFloorSwitch).toHaveAttribute('aria-checked', 'true');

    const distanceSlider = screen.getByRole('slider');
    fireEvent.change(distanceSlider, { target: { value: '700' } });
    expect(screen.getByText('700m')).toBeInTheDocument();

    const fastPace = screen.getByRole('radio', { name: 'Fast' });
    await user.click(fastPace);
    expect(fastPace).toHaveAttribute('aria-checked', 'true');
  });
});
