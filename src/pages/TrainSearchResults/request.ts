import type { TrainRouteSearchRequest } from '../../services/trainRoutesApi';

type TrainSearchRequestParams = {
  originName: string;
  destinationName: string;
  date: string;
  time: string;
};

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  return {
    day: Number(day),
    month: Number(month),
    year: Number(year),
  };
}

function parseTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, hours, minutes] = match;
  return {
    hours: Number(hours),
    minutes: Number(minutes),
  };
}

function assertValidDateTime(value: Date, date: NonNullable<ReturnType<typeof parseDate>>, time: NonNullable<ReturnType<typeof parseTime>>) {
  return (
    value.getFullYear() === date.year &&
    value.getMonth() === date.month - 1 &&
    value.getDate() === date.day &&
    value.getHours() === time.hours &&
    value.getMinutes() === time.minutes
  );
}

export function toIsoOffsetDateTime(date: string, time: string) {
  const parsedDate = parseDate(date);
  const parsedTime = parseTime(time);

  if (!parsedDate || !parsedTime) {
    throw new Error('Invalid departure date or time.');
  }

  const value = new Date(
    parsedDate.year,
    parsedDate.month - 1,
    parsedDate.day,
    parsedTime.hours,
    parsedTime.minutes,
    0,
    0
  );

  if (!assertValidDateTime(value, parsedDate, parsedTime)) {
    throw new Error('Invalid departure date or time.');
  }

  const offsetMinutes = -value.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffsetMinutes / 60)).padStart(2, '0');
  const offsetRemainderMinutes = String(absoluteOffsetMinutes % 60).padStart(2, '0');

  return `${date}T${time}:00${sign}${offsetHours}:${offsetRemainderMinutes}`;
}

export function buildTrainRouteSearchRequest(
  search: TrainSearchRequestParams
): TrainRouteSearchRequest {
  return {
    departureTime: toIsoOffsetDateTime(search.date, search.time),
    destination: search.destinationName,
    origin: search.originName,
  };
}
