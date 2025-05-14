import { createTRPCRouter } from "./init";
import { userRouter } from "./routers/userRouter";

export const trpcRouter = createTRPCRouter({
  user: userRouter,
});

export type TRPCRouter = typeof trpcRouter;
