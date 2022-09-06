import express from 'express';

import * as trpc from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import cors from 'cors';
import { z } from 'zod';

interface ChatMessage {
  user: string;
  message: string;
}

const messages: ChatMessage[] = [
  { user: 'user1', message: 'Hello' },
  { user: 'user2', message: 'Hi' },
];

const appRouter = trpc
  .router()
  .query('hello', {
    async resolve() {
      return 'Hello, world!!!';
    },
  })
  .query('getMessages', {
    input: z.number().default(10),
    async resolve({ input }) {
      return messages.slice(-input);
    },
  })
  .mutation('addMessage', {
    input: z.object({
      user: z.string(),
      message: z.string(),
    }),
    resolve({ input }) {
      messages.push(input);
      return input;
    },
  });

export type AppRouter = typeof appRouter;

const app = express();
const port = 8080;

app.use(cors());

// created for each request
const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({}); // no context
type Context = trpc.inferAsyncReturnType<typeof createContext>;

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.get('/', (req, res) => {
  res.send('Hello from api-server');
});

app.listen(port, () => {
  console.log(`api-server listening at http://localhost:${port}`);
});
