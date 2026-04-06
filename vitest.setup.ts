import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.stubGlobal(
  'fetch',
  vi.fn(
    async () =>
      new Response(JSON.stringify({ trips: [] }), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
  )
);
