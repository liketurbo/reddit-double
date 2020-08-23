import { EntityManager, IDatabaseDriver, Connection } from "mikro-orm";
import { Redis } from "ioredis";

export interface MyContext {
  em: EntityManager<IDatabaseDriver<Connection>>;
  session: Express.Session;
  redis: Redis;
}
