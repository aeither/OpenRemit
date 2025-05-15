import { createTRPCRouter } from "./init";
import { aiRouter } from "./routers/aiRouter";
import { userRouter } from "./routers/userRouter";

export const trpcRouter = createTRPCRouter({
  user: userRouter,
  ai: aiRouter,
});

export type TRPCRouter = typeof trpcRouter;
