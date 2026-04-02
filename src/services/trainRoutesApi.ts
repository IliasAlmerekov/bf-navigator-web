import type { TrainRouteResponse } from '../pages/TrainSearchResults/types';

export const BASE_URL = import.meta.env.VITE_TRAIN_ROUTES_API_URL ?? '/train-api';

export interface TrainRouteSearchRequest {
  origin: string;
  destination: string;
  departureTime: string;
}

export class TrainRoutesApiError extends Error {
  status: number;

  constructor(status: number, message = 'Unable to search train routes.') {
    super(message);
    this.name = 'TrainRoutesApiError';
    this.status = status;
  }
}

async function handleResponse(response: Response): Promise<TrainRouteResponse> {
  if (response.ok) {
    return (await response.json()) as TrainRouteResponse;
  }

  throw new TrainRoutesApiError(response.status);
}

export async function searchTrainRoute(
  request: TrainRouteSearchRequest,
  signal?: AbortSignal
): Promise<TrainRouteResponse> {
  const response = await fetch(`${BASE_URL}/routes/trains/debug`, {
    body: JSON.stringify(request),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    signal,
  });

  return handleResponse(response);
}
