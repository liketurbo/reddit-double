import { Redis } from "ioredis";

export interface MyContext {
  session: Express.Session;
  redis: Redis;
}
