import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomeSearch from './HomeSearch';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

function createJsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getRequestedQuery(input: Request | string | URL) {
  const requestUrl = input instanceof Request ? input.url : String(input);
  return new URL(requestUrl, 'http://localhost').searchParams.get('query');
}

describe('HomeSearch', () => {
  const fetchMock = vi.mocked(fetch);

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(createJsonResponse([]));
    mockNavigate.mockReset();
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

  it("renders date input with today's date", () => {
    render(<HomeSearch />);
    const today = new Date().toISOString().slice(0, 10);
    const dateInputs = screen.getAllByLabelText('Date');
    expect((dateInputs[0] as HTMLInputElement).value).toBe(today);
  });

  it('renders time input with default value', () => {
    render(<HomeSearch />);
    const timeInputs = screen.getAllByLabelText('Time');
    expect((timeInputs[0] as HTMLInputElement).value).toBe('09:00');
  });

  it('blocks submit and shows errors when origin not selected from autocomplete', async () => {
    render(<HomeSearch />);

    const originInput = screen.getAllByRole('combobox', { name: 'From' })[0];
    fireEvent.focus(originInput);
    fireEvent.change(originInput, { target: { value: 'Ber' } });

    const submitButton = screen.getAllByRole('button', { name: 'Find Optimal Route' })[0];
    fireEvent.click(submitButton);

    expect(
      await screen.findAllByText('Please select an origin station from the suggestions.')
    ).not.toHaveLength(0);
  });

  it('blocks submit and shows errors when destination not selected from autocomplete', async () => {
    fetchMock.mockResolvedValue(createJsonResponse([]));
    render(<HomeSearch />);

    const destInput = screen.getAllByRole('combobox', { name: 'To' })[0];
    fireEvent.focus(destInput);
    fireEvent.change(destInput, { target: { value: 'Mun' } });

    const submitButton = screen.getAllByRole('button', { name: 'Find Optimal Route' })[0];
    fireEvent.click(submitButton);

    expect(
      await screen.findAllByText('Please select a destination station from the suggestions.')
    ).not.toHaveLength(0);
  });

  it('navigates when both stations are selected', async () => {
    fetchMock.mockImplementation(async (input) => {
      const query = getRequestedQuery(input);

      if (query === 'Ham*') {
        return createJsonResponse([
          { city: 'Hamburg', evaNumber: 8002549, name: 'Hamburg Hbf', number: 1 },
        ]);
      }

      if (query === 'Ber*') {
        return createJsonResponse([
          { city: 'Berlin', evaNumber: 8011160, name: 'Berlin Hbf', number: 1 },
        ]);
      }

      return createJsonResponse([]);
    });

    render(<HomeSearch />);

    const originInputs = screen.getAllByRole('combobox', { name: 'From' });
    fireEvent.focus(originInputs[0]);
    fireEvent.change(originInputs[0], { target: { value: 'Ham' } });
    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([input]) => getRequestedQuery(input) === 'Ham*')).toBe(
        true
      );
    });
    const originOption = await screen.findByRole(
      'option',
      { name: /Hamburg Hbf/i },
      { timeout: 3000 }
    );
    fireEvent.mouseDown(originOption);
    fireEvent.click(originOption);

    const destInputs = screen.getAllByRole('combobox', { name: 'To' });
    fireEvent.focus(destInputs[0]);
    fireEvent.change(destInputs[0], { target: { value: 'Ber' } });
    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([input]) => getRequestedQuery(input) === 'Ber*')).toBe(
        true
      );
    });
    const destOption = await screen.findByRole(
      'option',
      { name: /Berlin Hbf/i },
      { timeout: 3000 }
    );
    fireEvent.mouseDown(destOption);
    fireEvent.click(destOption);

    const submitButton = screen.getAllByRole('button', { name: 'Find Optimal Route' })[0];
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Please select an origin station from the suggestions.')
      ).not.toBeInTheDocument();
    });

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/train-search-results' });
  });
});
