import { describe, expect, it } from 'vitest';

function createExpectedLocalIsoDateTime(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const value = new Date(year, month - 1, day, hours, minutes);
  const offsetMinutes = -value.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffsetMinutes / 60)).padStart(2, '0');
  const offsetRemainderMinutes = String(absoluteOffsetMinutes % 60).padStart(2, '0');

  return `${date}T${time}:00${sign}${offsetHours}:${offsetRemainderMinutes}`;
}

describe('train search request helpers', () => {
  it('converts date and time into an ISO-8601 datetime with a timezone offset', async () => {
    const { toIsoOffsetDateTime } = await import('./request');

    const departureTime = toIsoOffsetDateTime('2026-04-02', '13:45');

    expect(departureTime).toBe(createExpectedLocalIsoDateTime('2026-04-02', '13:45'));
    expect(departureTime).toMatch(
      /^2026-04-02T13:45:00(?:\+|-)\d{2}:\d{2}$/
    );
    expect(departureTime.endsWith('Z')).toBe(false);
  });

  it('builds a train route request body from the current search params', async () => {
    const { buildTrainRouteSearchRequest } = await import('./request');

    expect(
      buildTrainRouteSearchRequest({
        date: '2026-04-02',
        destinationName: 'Braunschweig Hbf',
        originName: 'Hamburg Hbf',
        time: '13:45',
      })
    ).toEqual({
      departureTime: createExpectedLocalIsoDateTime('2026-04-02', '13:45'),
      destination: 'Braunschweig Hbf',
      origin: 'Hamburg Hbf',
    });
  });

  it('throws when date or time cannot be converted into a valid departure datetime', async () => {
    const { buildTrainRouteSearchRequest } = await import('./request');

    expect(() =>
      buildTrainRouteSearchRequest({
        date: 'invalid-date',
        destinationName: 'Braunschweig Hbf',
        originName: 'Hamburg Hbf',
        time: '13:45',
      })
    ).toThrow('Invalid departure date or time.');

    expect(() =>
      buildTrainRouteSearchRequest({
        date: '2026-04-02',
        destinationName: 'Braunschweig Hbf',
        originName: 'Hamburg Hbf',
        time: '99:99',
      })
    ).toThrow('Invalid departure date or time.');
  });
});
