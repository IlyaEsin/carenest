import { setupServer } from 'msw/node';

// Component tests talk to this fake API; each test registers the handlers it needs with server.use().
export const server = setupServer();
