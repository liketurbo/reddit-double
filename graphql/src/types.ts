import { Redis } from "ioredis";
import createUserLoader from "./loaders/createUserLoader";

export interface MyContext {
  session: Express.Session;
  redis: Redis;
  loaders: [ReturnType<typeof createUserLoader>];
}
