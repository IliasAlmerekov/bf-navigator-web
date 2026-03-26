import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomeSearch from './HomeSearch';

function createJsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('HomeSearch', () => {
  const fetchMock = vi.mocked(fetch);

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(createJsonResponse([]));
  });

  it('shows station suggestions for a typed city', async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse([
        {
          city: 'Hamburg',
          evaNumber: 8002549,
          name: 'Hamburg Hbf',
          number: 1,
        },
      ])
    );

    render(<HomeSearch />);

    const fromInput = screen.getAllByRole('combobox', { name: 'From' })[0];

    fireEvent.focus(fromInput);
    fireEvent.change(fromInput, { target: { value: 'Ham' } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByRole('option', { name: /Hamburg Hbf/i })).toBeInTheDocument();
  });

  it('fills the field when a station is selected', async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse([
        {
          city: 'Hamburg',
          evaNumber: 8002549,
          name: 'Hamburg Hbf',
          number: 1,
        },
      ])
    );

    render(<HomeSearch />);

    const fromInput = screen.getAllByRole('combobox', { name: 'From' })[0] as HTMLInputElement;

    fireEvent.focus(fromInput);
    fireEvent.change(fromInput, { target: { value: 'Ham' } });

    const option = await screen.findByRole('option', { name: /Hamburg Hbf/i });

    fireEvent.mouseDown(option);
    fireEvent.click(option);

    expect(fromInput.value).toBe('Hamburg Hbf');
  });
});
