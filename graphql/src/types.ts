import { Redis } from "ioredis";
import createUserLoader from "./loaders/createUserLoader";
import createUpdootValueLoader from "./loaders/createUpdootValueLoader";

export interface MyContext {
  session: Express.Session;
  redis: Redis;
  loaders: {
    UserLoader: ReturnType<typeof createUserLoader>;
    UpdootValueLoader: ReturnType<typeof createUpdootValueLoader>;
  };
}
